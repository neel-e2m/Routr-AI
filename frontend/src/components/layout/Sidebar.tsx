import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Inbox, FlaskConical, Wand2, GitBranch,
  BarChart3, Settings, ChevronLeft, Upload, Route,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/hooks/useUIStore'
import { Button } from '@/components/ui/button'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inbox', icon: Inbox, label: 'AI Inbox' },
  { to: '/import', icon: Upload, label: 'Import' },
  { to: '/playground', icon: Wand2, label: 'AI Playground' },
  { to: '/simulator', icon: FlaskConical, label: 'Simulator' },
  { to: '/routing', icon: GitBranch, label: 'Routing Rules' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="hidden md:flex flex-col border-r border-border/60 bg-card/50 h-screen sticky top-0 shrink-0"
    >
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border/60">
        <div className="rounded-lg bg-primary p-1.5 shrink-0">
          <Route className="h-5 w-5 text-primary-foreground" />
        </div>
        {!sidebarCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="font-semibold text-sm">Routr AI</p>
            <p className="text-[10px] text-muted-foreground">Support Triage</p>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border/60">
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={toggleSidebar}>
          <ChevronLeft className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
          {!sidebarCollapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>
    </motion.aside>
  )
}
