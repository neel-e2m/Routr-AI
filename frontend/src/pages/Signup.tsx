import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Mail, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    const { data, error } = await signUp(email, password, fullName)
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    if (!data?.session) {
      setIsSubmitted(true)
      toast.success('Check your email to verify your account')
      return
    }

    toast.success('Account created successfully')
    navigate('/')
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSubmitted ? 'Check your email' : 'Create your account'}</CardTitle>
          <CardDescription>
            {isSubmitted 
              ? `We've sent a verification link to ${email}.`
              : 'Start building AI-powered support triage in minutes.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center space-y-6 py-4 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to verify your account. If you don't see it, check your spam folder.
              </p>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setIsSubmitted(false)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Wrong email? Back to sign up
              </Button>
            </div>
          ) : (
            <>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-medium">Full Name</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Email</label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Password</label>
                  <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
                </div>
                <Button type="submit" className="w-full" isLoading={loading}>
                  Create account
                </Button>
              </form>
              <p className="mt-4 text-sm text-muted-foreground text-center">
                Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
