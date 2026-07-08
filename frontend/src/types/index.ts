export const CATEGORIES = [
  'Website Issue', 'Bug Report', 'Billing', 'Payment', 'Design Request',
  'SEO', 'Marketing', 'API Issue', 'Login Problem', 'Feature Request',
  'Security', 'General Inquiry', 'Other',
] as const

export const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'] as const
export const STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const
export const SENTIMENTS = ['Positive', 'Neutral', 'Negative', 'Frustrated'] as const

export type Category = typeof CATEGORIES[number]
export type Priority = typeof PRIORITIES[number]
export type Status = typeof STATUSES[number]
export type Sentiment = typeof SENTIMENTS[number]

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  theme: 'light' | 'dark' | 'system'
  onboarding_completed: boolean
}

export interface Department {
  id: string
  name: string
  slug: string
  color: string
  description: string | null
}

export interface Ticket {
  id: string
  user_id: string
  client_name: string
  client_email: string
  company: string
  subject: string
  body: string
  status: Status
  category: string | null
  priority: Priority | null
  department_id: string | null
  sentiment: Sentiment | null
  is_read: boolean
  is_ai_analyzed: boolean
  source: string
  created_at: string
  updated_at: string
  resolved_at: string | null
  departments?: Department | null
  ticket_analysis?: TicketAnalysis[]
}

export interface TicketAnalysis {
  id: string
  ticket_id: string
  category: string
  priority: string
  department: string
  sentiment: string
  confidence: number
  summary: string
  reasoning: string
  suggested_reply: string
  suggested_action: string
  estimated_resolution: string
  model_used: string | null
  created_at: string
}

export interface RoutingRule {
  id: string
  user_id: string
  category: string
  department_id: string
  is_active: boolean
  priority_order: number
  departments?: Department
}

export interface Activity {
  id: string
  ticket_id: string
  action_type: string
  description: string
  metadata: Record<string, unknown>
  created_at: string
  tickets?: { subject: string }
}

export interface TicketNote {
  id: string
  ticket_id: string
  content: string
  created_at: string
}

export interface Settings {
  id: string
  user_id: string
  groq_api_key: string | null
  ai_model: string
  notification_prefs: { email: boolean; critical: boolean; resolved: boolean }
  ai_prefs: Record<string, unknown>
}

export interface AnalyticsOverview {
  total_tickets: number
  critical_tickets: number
  open_tickets: number
  resolved_tickets: number
  ai_accuracy: number
  avg_response_time_hours: number
  avg_resolution_time_hours: number
  category_breakdown: { name: string; value: number }[]
  priority_distribution: { name: string; value: number }[]
  department_workload: { name: string; value: number }[]
  weekly_trend: { day: string; count: number }[]
  sentiment_distribution: { name: string; value: number }[]
  department_performance: { department: string; total: number; resolved: number; rate: number }[]
  confidence_histogram: { range: string; count: number }[]
  recent_activities: { id: string; action_type: string; description: string; created_at: string; ticket_subject: string }[]
}

export interface AnalysisResult {
  category: string
  priority: string
  department: string
  sentiment: string
  confidence: number
  summary: string
  reasoning: string
  suggested_reply: string
  suggested_action: string
  estimated_resolution: string
}
