import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from './useUIStore'

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const setCommandOpen = useUIStore((s) => s.setCommandOpen)

  const handler = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setCommandOpen(true)
    }
    if (e.key === '?' && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
      e.preventDefault()
      setCommandOpen(true)
    }
    if (e.key === 'g') {
      const next = (ev: KeyboardEvent) => {
        if (ev.key === 'd') navigate('/')
        if (ev.key === 'i') navigate('/inbox')
        if (ev.key === 'a') navigate('/analytics')
        if (ev.key === 's') navigate('/settings')
        window.removeEventListener('keydown', next)
      }
      window.addEventListener('keydown', next, { once: true })
    }
  }, [navigate, setCommandOpen])

  useEffect(() => {
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handler])
}
