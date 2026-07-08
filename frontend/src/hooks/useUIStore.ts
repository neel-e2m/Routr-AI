import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  commandOpen: boolean
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setCommandOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'system',
      commandOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      setCommandOpen: (open) => set({ commandOpen: open }),
    }),
    { name: 'routr-ui', partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, theme: s.theme }) }
  )
)
