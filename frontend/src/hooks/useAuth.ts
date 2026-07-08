import { useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!active) return
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to initialize auth session', error)
        if (active) setLoading(false)
      }
    }

    initAuth()

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        const existingProfile = await fetchProfile(session.user.id)
        if (!existingProfile) {
          await bootstrapUser(session.user)
          await fetchProfile(session.user.id)
        }
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    active = true
    return () => {
      active = false
      data?.subscription?.unsubscribe()
    }
  }, [])

  async function bootstrapUser(user: User) {
    const fullName = (user.user_metadata as any)?.full_name || user.email?.split('@')[0] || 'User'
    const profile = {
      id: user.id,
      email: user.email,
      full_name: fullName,
      theme: 'system',
      onboarding_completed: true,
    }

    await supabase.from('profiles').insert(profile)
    await supabase.from('settings').insert({ user_id: user.id })

    const defaultDepartments = [
      { user_id: user.id, name: 'Engineering', slug: 'engineering', color: '#3b82f6', is_default: true },
      { user_id: user.id, name: 'Finance', slug: 'finance', color: '#22c55e', is_default: true },
      { user_id: user.id, name: 'Marketing', slug: 'marketing', color: '#a855f7', is_default: true },
      { user_id: user.id, name: 'Creative', slug: 'creative', color: '#ec4899', is_default: true },
      { user_id: user.id, name: 'Support', slug: 'support', color: '#f97316', is_default: true },
      { user_id: user.id, name: 'Security', slug: 'security', color: '#ef4444', is_default: true },
    ]
    await supabase.from('departments').insert(defaultDepartments)

    const { data: departments } = await supabase
      .from('departments')
      .select('id, slug')
      .eq('user_id', user.id)
      .in('slug', ['engineering', 'finance', 'marketing', 'creative'])

    const routingRules = [
      { user_id: user.id, category: 'Website Issue', department_id: departments?.find((d: any) => d.slug === 'engineering')?.id },
      { user_id: user.id, category: 'Bug Report', department_id: departments?.find((d: any) => d.slug === 'engineering')?.id },
      { user_id: user.id, category: 'API Issue', department_id: departments?.find((d: any) => d.slug === 'engineering')?.id },
      { user_id: user.id, category: 'Login Problem', department_id: departments?.find((d: any) => d.slug === 'engineering')?.id },
      { user_id: user.id, category: 'Billing', department_id: departments?.find((d: any) => d.slug === 'finance')?.id },
      { user_id: user.id, category: 'Payment', department_id: departments?.find((d: any) => d.slug === 'finance')?.id },
      { user_id: user.id, category: 'SEO', department_id: departments?.find((d: any) => d.slug === 'marketing')?.id },
      { user_id: user.id, category: 'Marketing', department_id: departments?.find((d: any) => d.slug === 'marketing')?.id },
      { user_id: user.id, category: 'Design Request', department_id: departments?.find((d: any) => d.slug === 'creative')?.id },
    ].filter((rule) => rule.department_id)

    if (routingRules.length) {
      await supabase.from('routing_rules').insert(routingRules)
    }
  }

  async function fetchProfile(id: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
    if (error && error.code !== 'PGRST116') {
      console.error('Failed to fetch profile', error)
    }
    setProfile(data ?? null)
    setLoading(false)
    return data ?? null
  }

  const signIn = (email: string, password: string) => supabase.auth.signInWithPassword({ email, password })
  const signUp = (email: string, password: string, fullName: string) =>
    supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
  const signOut = () => supabase.auth.signOut()
  const resetPassword = (email: string) => supabase.auth.resetPasswordForEmail(email)

  return { user, session, profile, loading, signIn, signUp, signOut, resetPassword, refreshProfile: () => user && fetchProfile(user.id) }
}
