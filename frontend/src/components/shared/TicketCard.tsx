import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { updateTicket } from '@/services/tickets'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Ticket } from '@/types'

const priorityVariant = (p: string | null) => {
  if (p === 'Critical') return 'critical'
  if (p === 'High') return 'high'
  if (p === 'Medium') return 'medium'
  return 'low'
}

interface TicketCardProps {
  ticket: Ticket
  selected?: boolean
  onSelect?: (id: string) => void
}

export function TicketCard({ ticket, selected, onSelect }: TicketCardProps) {
  const queryClient = useQueryClient()
  const analysis = Array.isArray(ticket.ticket_analysis) ? ticket.ticket_analysis[0] : ticket.ticket_analysis
  const confidence = analysis?.confidence

  const resolveMutation = useMutation({
    mutationFn: () => updateTicket(ticket.id, { status: 'resolved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      toast.success('Ticket marked as resolved')
    },
    onError: (err: any) => toast.error(err.message || 'Failed to resolve ticket')
  })

  const handleResolve = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    resolveMutation.mutate()
  }

  const status = ticket.status || 'open'
  const createdAt = ticket.created_at ? new Date(ticket.created_at) : new Date()

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Link
        to={`/inbox/${ticket.id}`}
        className={cn(
          'block rounded-xl border border-border/60 bg-card p-5 transition-all hover:shadow-md hover:border-border',
          !ticket.is_read && 'border-l-4 border-l-primary',
          selected && 'ring-2 ring-primary'
        )}
        onClick={() => onSelect?.(ticket.id)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {!ticket.is_read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
              <h3 className="font-medium text-base truncate">{ticket.subject.replace(/^Subject:\s*/i, '')}</h3>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {ticket.client_name} · {ticket.company}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {ticket.category && <Badge variant="secondary">{ticket.category}</Badge>}
              {ticket.priority && <Badge variant={priorityVariant(ticket.priority) as 'critical'}>{ticket.priority}</Badge>}
              <Badge variant="outline" className="capitalize">{status.replace('_', ' ')}</Badge>
            </div>
            {analysis?.suggested_reply && (
              <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm">
                <div className="flex items-center gap-1.5 font-medium text-primary mb-1">
                  <Sparkles className="h-3.5 w-3.5" /> AI Analysis
                </div>
                <p className="line-clamp-2 text-muted-foreground">{analysis.suggested_reply}</p>
                {analysis.reasoning && <p className="mt-1 line-clamp-1 text-xs italic text-muted-foreground/70">Reasoning: {analysis.reasoning}</p>}
              </div>
            )}
          </div>
          <div className="text-right shrink-0 space-y-2 flex flex-col items-end">
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </p>
            {confidence != null && (
              <p className="text-xs font-medium text-primary">{Math.round(confidence)}% conf.</p>
            )}
            {ticket.departments && (
              <p className="text-xs text-muted-foreground">{ticket.departments.name}</p>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        {status !== 'resolved' && status !== 'closed' && (
          <div className="mt-4 pt-3 flex justify-end border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-4 text-xs font-medium bg-background hover:bg-primary hover:text-primary-foreground transition-all duration-200 ease-in-out"
              onClick={handleResolve}
              isLoading={resolveMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Mark as Resolved
            </Button>
          </div>
        )}
      </Link>
    </motion.div>
  )
}
