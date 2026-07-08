import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fetchTickets } from '@/services/tickets'
import { TicketCard } from '@/components/shared/TicketCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Link } from 'react-router-dom'

export default function Inbox() {
  const { data: tickets, isLoading, isError, error } = useQuery({ queryKey: ['tickets'], queryFn: fetchTickets })
  const [filter, setFilter] = useState('all')

  const filteredTickets = useMemo(() => {
    if (!tickets) return []
    if (filter === 'all') return tickets
    return tickets.filter(t => {
      const status = t.status || 'open'
      if (filter === 'open') return status !== 'resolved' && status !== 'closed'
      if (filter === 'resolved') return status === 'resolved' || status === 'closed'
      return true
    })
  }, [tickets, filter])

  if (isLoading) return <div>Loading tickets…</div>
  if (isError) return <div className="text-destructive">Unable to load tickets: {(error as Error)?.message || 'Unknown error'}</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">AI Inbox</h2>
          <p className="text-sm text-muted-foreground">Manage support tickets, search, and review AI analysis.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="Filter..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tickets</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button asChild>
            <Link to="/import" className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Import tickets
            </Link>
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div>Loading tickets…</div>
      ) : filteredTickets.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p className="font-semibold">No tickets yet</p>
          <p className="text-sm text-muted-foreground">Import demo data or create a ticket to get started.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button asChild>
              <Link to="/import">Import</Link>
            </Button>
            <Button asChild>
              <Link to="/simulator">Generate sample tickets</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
