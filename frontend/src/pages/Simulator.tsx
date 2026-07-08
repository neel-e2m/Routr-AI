import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Simulator() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const mutation = useMutation({
    mutationFn: () => apiFetch<{ message: string }>('/api/simulator/generate', { method: 'POST' }),
    onSuccess: (data) => {
      setError('')
      setMessage(data.message)
      toast.success('Demo tickets generated successfully')
    },
    onError: (err: unknown) => {
      setError((err as Error)?.message || 'Failed to generate tickets')
      toast.error((err as Error)?.message || 'Failed to generate tickets')
    }
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Ticket Simulator</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Generate 50 realistic support tickets and run AI analysis automatically.</p>
          <Button onClick={() => mutation.mutate()} isLoading={mutation.isPending}>Generate demo tickets</Button>
          {mutation.isSuccess && <p className="mt-4 text-sm text-foreground">{message}</p>}
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
