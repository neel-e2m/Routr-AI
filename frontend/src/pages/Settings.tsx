import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { fetchDepartments } from '@/services/tickets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Settings as SettingsType } from '@/types'

async function fetchSettings() {
  const { data, error } = await supabase.from('settings').select('*').single()
  if (error) throw error
  return data as SettingsType
}

export default function Settings() {
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const [groqKey, setGroqKey] = useState('')
  const mutation = useMutation({
    mutationFn: async (payload: Partial<SettingsType>) => {
      const { data: updated, error } = await supabase.from('settings').update(payload).eq('id', data?.id).single()
      if (error) throw error
      return updated as SettingsType
    },
    onSuccess: () => toast.success('Settings saved successfully'),
    onError: (err: any) => toast.error(err.message || 'Failed to save settings'),
  })

  if (isLoading) return <div>Loading settings…</div>
  if (isError) return <div className="text-destructive">Unable to load settings: {(error as Error)?.message || 'Unknown error'}</div>
  if (!data) return <div>No settings found.</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>AI Settings</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Groq API key</label>
              <Input value={groqKey} onChange={(e) => setGroqKey(e.target.value)} placeholder="Override your API key" />
            </div>
            <Button onClick={() => mutation.mutate({ groq_api_key: groqKey })} isLoading={mutation.isPending}>Save settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
