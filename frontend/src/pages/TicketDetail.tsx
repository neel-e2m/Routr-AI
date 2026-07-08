import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Sparkles, Clock, MessageSquare, Bot, Activity as ActivityIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fetchTicket, fetchNotes, fetchActivities } from '@/services/tickets'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const priorityVariant = (p: string | null) => {
  if (p === 'Critical') return 'critical'
  if (p === 'High') return 'high'
  if (p === 'Medium') return 'medium'
  return 'low'
}

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { data: ticket, isLoading, isError, error } = useQuery({ 
    queryKey: ['ticket', id], 
    queryFn: () => fetchTicket(id || '') 
  })
  const { data: notes } = useQuery({ 
    queryKey: ['notes', id], 
    queryFn: () => fetchNotes(id || ''), 
    enabled: !!id 
  })
  const { data: activities } = useQuery({ 
    queryKey: ['activities', id], 
    queryFn: () => fetchActivities(id || ''), 
    enabled: !!id 
  })

  if (isLoading) return <div>Loading ticket…</div>
  if (isError) return <div className="text-destructive">Unable to load ticket: {(error as Error)?.message || 'Unknown error'}</div>
  if (!ticket) return <div>Ticket not found</div>

  const analysis = Array.isArray(ticket.ticket_analysis) ? ticket.ticket_analysis[0] : ticket.ticket_analysis
  const createdAt = ticket.created_at ? new Date(ticket.created_at) : new Date()

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header and Back Button */}
      <div className="flex flex-col gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to tickets
          </Button>
        </div>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{ticket.subject.replace(/^Subject:\s*/i, '')}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{ticket.client_name}</span>
              <span>·</span>
              <span>{ticket.company}</span>
              <span>·</span>
              <span>{ticket.client_email}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">{(ticket.status || 'open').replace('_', ' ')}</Badge>
            {ticket.priority && <Badge variant={priorityVariant(ticket.priority) as 'critical'}>{ticket.priority}</Badge>}
            {ticket.category && <Badge variant="secondary">{ticket.category}</Badge>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Original Message
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-sm leading-relaxed whitespace-pre-wrap">
              {ticket.body}
            </CardContent>
          </Card>

          {analysis ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-4 border-b border-primary/10">
                <CardTitle className="text-base flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                  AI Analysis
                </CardTitle>
                <CardDescription className="text-primary/70">
                  {analysis.confidence != null ? `Confidence: ${Math.round(analysis.confidence)}%` : 'AI generated insights'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {analysis.summary && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-primary/90">Summary</h4>
                    <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                  </div>
                )}
                {analysis.suggested_reply && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-primary/90">Suggested Reply</h4>
                    <div className="rounded-md bg-background/60 p-3 text-sm text-foreground/90 border border-primary/10 whitespace-pre-wrap">
                      {analysis.suggested_reply}
                    </div>
                  </div>
                )}
                {analysis.reasoning && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-primary/90">Reasoning</h4>
                    <p className="text-sm text-muted-foreground italic">{analysis.reasoning}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Ticket Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium">{ticket.departments?.name || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source</span>
                <span className="font-medium capitalize">{ticket.source || 'Manual'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2">
                <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {activities?.length ? (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {activities.map((activity) => (
                    <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full border border-border bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] border border-border/50 rounded-lg p-3 text-sm bg-card/50">
                        <p className="font-medium">{activity.action_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
                Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {notes?.length ? (
                notes.map((note) => (
                  <div key={note.id} className="rounded-lg bg-muted/50 p-3 text-sm">
                    <p>{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-2 text-right">
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No internal notes.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
