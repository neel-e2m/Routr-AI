import { useQuery } from '@tanstack/react-query'
import { BarChart3, Flame, CheckCircle2, Activity, Bell, ArrowUpRight } from 'lucide-react'
import { fetchAnalyticsOverview } from '@/services/analytics'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['analytics', 'overview'], queryFn: () => fetchAnalyticsOverview() })

  if (isLoading) return <div>Loading dashboard…</div>
  if (isError) return <div className="text-destructive">Failed to load dashboard: {(error as Error)?.message || 'Unknown error'}</div>
  if (!data) return <div className="text-muted-foreground">No dashboard data available.</div>

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4 lg:grid-cols-2">
        <StatCard title="Total tickets" value={data.total_tickets} icon={Activity} />
        <StatCard title="Critical" value={data.critical_tickets} icon={Flame} className="bg-orange-50" />
        <StatCard title="Open" value={data.open_tickets} icon={Bell} />
        <StatCard title="Resolved" value={data.resolved_tickets} icon={CheckCircle2} />
      </div>
      <div className="grid gap-4 xl:grid-cols-3 lg:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Category breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.category_breakdown.slice(0, 6).map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.value} tickets</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Priority distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.priority_distribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <p className="text-sm">{item.name}</p>
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recent_activities.map((activity) => (
              <div key={activity.id} className="rounded-xl border border-border/60 p-4">
                <p className="font-medium">{activity.description}</p>
                <p className="text-sm text-muted-foreground">{activity.ticket_subject}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
