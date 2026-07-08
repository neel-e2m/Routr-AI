import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle>404 — Page not found</CardTitle>
          <CardDescription>We couldn’t find that page. Try returning to the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/">Go back home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
