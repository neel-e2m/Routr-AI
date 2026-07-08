import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ImportPage() {
  const [input, setInput] = useState('')
  const [message, setMessage] = useState('')
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: { tickets: Array<{ subject: string; body: string; client_name?: string; client_email?: string; company?: string }> }) => apiFetch<{ imported: number }>('/api/tickets/import', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: (data) => {
      setMessage(`Imported ${data.imported} tickets.`)
      toast.success(`Imported ${data.imported} tickets successfully`)
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      setInput('')
    },
  })

  const [error, setError] = useState('')

  const handleSubmit = () => {
    setError('')
    const rawTickets = input.split('---').map((chunk) => chunk.trim()).filter(Boolean)
    const tickets = rawTickets.map((chunk) => {
      const lines = chunk.split('\n').map((line) => line.trim())
      const subject = lines[0] || 'Imported ticket'
      const body = lines.slice(1).join('\n')
      return { subject, body }
    })
    mutation.mutate({ tickets }, {
      onError: (err: unknown) => {
        setError((err as Error)?.message || 'Import failed')
        toast.error((err as Error)?.message || 'Import failed')
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Bulk Import</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Paste one or more emails below and separate each with <code>---</code>.</p>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={12} />
          <div className="mt-4 flex items-center gap-2">
            <Button onClick={handleSubmit} isLoading={mutation.isPending}>Import tickets</Button>
            {mutation.isSuccess && <span className="text-sm text-foreground">{message}</span>}
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
