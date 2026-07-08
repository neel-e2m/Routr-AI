import { useEffect } from 'react'
import { useUIStore } from './useUIStore'

export function useTheme() {
  const { theme, setTheme } = useUIStore()

  useEffect(() => {
    const root = document.documentElement
    const apply = (t: 'light' | 'dark') => {
      root.classList.toggle('dark', t === 'dark')
    }
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      apply(mq.matches ? 'dark' : 'light')
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
    apply(theme)
  }, [theme])

  return { theme, setTheme }
}
