import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Playground() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const mutation = useMutation({
    mutationFn: (payload: { subject: string; text: string }) => apiFetch('/api/ai/analyze', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: (data) => {
      setError('')
      setResult(data)
      toast.success('Analysis complete')
    },
    onError: (err: unknown) => {
      setError((err as Error)?.message || 'Analysis failed')
      toast.error((err as Error)?.message || 'Analysis failed')
    }
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>AI Playground</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Subject</label>
              <input className="w-full rounded-lg border border-input bg-background px-3 py-2" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Message</label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} />
            </div>
            <Button onClick={() => mutation.mutate({ subject, text: body })} isLoading={mutation.isPending}>Analyze</Button>
          </div>
          {error && <div className="text-destructive">{error}</div>}
          {result && (
            <div className="mt-6 rounded-xl border border-border/60 bg-card p-5">
              <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
