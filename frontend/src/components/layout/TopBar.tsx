import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'

export function TopBar() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith('/inbox')) return 'AI Inbox'
    if (location.pathname.startsWith('/playground')) return 'AI Playground'
    if (location.pathname.startsWith('/simulator')) return 'Simulator'
    if (location.pathname.startsWith('/analytics')) return 'Analytics'
    if (location.pathname.startsWith('/routing')) return 'Routing Rules'
    if (location.pathname.startsWith('/settings')) return 'Settings'
    if (location.pathname.startsWith('/import')) return 'Import'
    if (location.pathname.startsWith('/onboarding')) return 'Onboarding'
    return 'Dashboard'
  }, [location.pathname])

  return (
    <div className="flex h-16 items-center justify-between gap-4 border-b border-border/60 bg-background/70 px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{pageTitle}</p>
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10 pr-4" placeholder="Search tickets or pages..." onFocus={() => navigate('/inbox')} />
        </div>
        <Button variant="outline" size="sm" onClick={() => signOut().then(() => navigate('/login'))}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
