import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useUIStore } from '@/hooks/useUIStore'

export default function Onboarding() {
  const { user } = useAuth()
  const { setTheme } = useUIStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleNext = async () => {
    if (step === 3) {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        navigate('/')
      }, 500)
      return
    }
    setStep((prev) => prev + 1)
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Welcome to Routr AI</CardTitle>
          <CardDescription>Finish a quick setup to start triaging support tickets.</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && <div className="space-y-4"><p className="text-sm text-muted-foreground">We’ll ask a few questions to personalize your workspace.</p></div>}
          {step === 2 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium">Preferred theme</label>
              <Select onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {step === 3 && <div className="space-y-4"><p className="text-sm text-muted-foreground">You’re ready to start creating tickets and analyzing them with AI.</p></div>}
          <div className="mt-6 flex items-center justify-between gap-4">
            <Button variant="outline" onClick={() => setStep((prev) => Math.max(prev - 1, 1))} disabled={step === 1}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={loading}>
              {step === 3 ? loading ? 'Finishing…' : 'Complete setup' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
