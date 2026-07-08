import { apiFetch } from '@/lib/api'
import type { AnalyticsOverview } from '@/types'

export async function fetchAnalyticsOverview() {
  return apiFetch<AnalyticsOverview>('/api/analytics/overview')
}
