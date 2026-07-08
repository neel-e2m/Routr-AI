import { supabase } from '@/lib/supabase'
import type { Ticket, TicketNote, Activity, Department, RoutingRule } from '@/types'

export async function fetchTickets() {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, departments(*), ticket_analysis(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Ticket[]
}

export async function fetchTicket(id: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, departments(*), ticket_analysis(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Ticket
}

export async function updateTicket(id: string, updates: Partial<Ticket>) {
  const { data, error } = await supabase.from('tickets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single()
  if (error) throw error
  if (updates.status === 'resolved' || updates.status === 'closed') {
    await supabase.from('tickets').update({ resolved_at: new Date().toISOString() }).eq('id', id)
  }
  return data as Ticket
}

export async function createTicket(ticket: { subject: string; body: string; client_name: string; client_email: string; company: string }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase.from('tickets').insert({ ...ticket, user_id: user.id, source: 'manual' }).select().single()
  if (error) throw error
  await supabase.from('activities').insert({ ticket_id: data.id, user_id: user.id, action_type: 'created', description: `Ticket created: ${ticket.subject}` })
  return data as Ticket
}

export async function fetchNotes(ticketId: string) {
  const { data, error } = await supabase.from('ticket_notes').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: false })
  if (error) throw error
  return data as TicketNote[]
}

export async function addNote(ticketId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase.from('ticket_notes').insert({ ticket_id: ticketId, user_id: user.id, content }).select().single()
  if (error) throw error
  await supabase.from('activities').insert({ ticket_id: ticketId, user_id: user.id, action_type: 'note_added', description: 'Internal note added' })
  return data as TicketNote
}

export async function fetchActivities(ticketId: string) {
  const { data, error } = await supabase.from('activities').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: false })
  if (error) throw error
  return data as Activity[]
}

export async function fetchDepartments() {
  const { data, error } = await supabase.from('departments').select('*').order('name')
  if (error) throw error
  return data as Department[]
}

export async function fetchRoutingRules() {
  const { data, error } = await supabase.from('routing_rules').select('*, departments(*)').order('category')
  if (error) throw error
  return data as RoutingRule[]
}

export async function createRoutingRule(category: string, departmentId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase.from('routing_rules').insert({ user_id: user.id, category, department_id: departmentId }).select('*, departments(*)').single()
  if (error) throw error
  return data as RoutingRule
}

export async function deleteRoutingRule(id: string) {
  const { error } = await supabase.from('routing_rules').delete().eq('id', id)
  if (error) throw error
}

export async function updateRoutingRule(id: string, updates: Partial<RoutingRule>) {
  const { data, error } = await supabase.from('routing_rules').update(updates).eq('id', id).select('*, departments(*)').single()
  if (error) throw error
  return data as RoutingRule
}
