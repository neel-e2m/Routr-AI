import { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command, CommandDialog, CommandInput, CommandItem } from 'cmdk'
import { useUIStore } from '@/hooks/useUIStore'

const commands = [
  { label: 'Dashboard', path: '/' },
  { label: 'AI Inbox', path: '/inbox' },
  { label: 'Import Tickets', path: '/import' },
  { label: 'AI Playground', path: '/playground' },
  { label: 'Ticket Simulator', path: '/simulator' },
  { label: 'Routing Rules', path: '/routing' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Settings', path: '/settings' },
]

export function CommandPalette() {
  const open = useUIStore((state) => state.commandOpen)
  const setOpen = useUIStore((state) => state.setCommandOpen)
  const navigate = useNavigate()

  const handleSelect = useCallback(
    (path: string) => {
      setOpen(false)
      navigate(path)
    },
    [navigate, setOpen]
  )

  const filtered = useMemo(() => commands, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen} label="Command palette">
      <CommandInput placeholder="Type a page or action..." />
      <Command>
        <div className="max-h-80 overflow-y-auto">
          {filtered.map((item) => (
            <CommandItem key={item.path} onSelect={() => handleSelect(item.path)}>
              {item.label}
            </CommandItem>
          ))}
        </div>
      </Command>
    </CommandDialog>
  )
}
