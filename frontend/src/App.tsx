import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useTheme } from '@/hooks/useTheme'
import { useUIStore } from '@/hooks/useUIStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { CommandPalette } from '@/components/layout/CommandPalette'
import Dashboard from '@/pages/Dashboard'
import Inbox from '@/pages/Inbox'
import TicketDetail from '@/pages/TicketDetail'
import Playground from '@/pages/Playground'
import Simulator from '@/pages/Simulator'
import ImportPage from '@/pages/Import'
import Routing from '@/pages/Routing'
import Analytics from '@/pages/Analytics'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import ForgotPassword from '@/pages/ForgotPassword'
import NotFound from '@/pages/NotFound'

function App() {
  const { user, loading } = useAuth()
  useTheme()
  useKeyboardShortcuts()
  const commandOpen = useUIStore((state) => state.commandOpen)

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-foreground">
        <div className="rounded-2xl border border-border/70 bg-card p-8 shadow-xl">Loading application...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <TopBar />
          <main className="flex-1 px-4 py-6 md:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/inbox/:id" element={<TicketDetail />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/import" element={<ImportPage />} />
              <Route path="/routing" element={<Routing />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/signup" element={<Navigate to="/" replace />} />
              <Route path="/forgot-password" element={<Navigate to="/" replace />} />
              <Route path="/onboarding/*" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
      {commandOpen && <CommandPalette />}
      <Toaster richColors position="top-right" />
    </div>
  )
}

export default App
