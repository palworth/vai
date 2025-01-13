'use client'

import { useState } from 'react'
import { useSignIn } from '@/app/hooks/useSignIn'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, error: signInError, loading } = useSignIn()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting to sign in with email:', email);
    try {
      const success = await signIn(email, password);
      if (success) {
        console.log('Sign-in successful, redirecting to home');
        router.push('/');  // Redirect to home page after successful login
      }
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {signInError && (
        <Alert variant="destructive">
          <AlertDescription>{signInError}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Log in'}
      </Button>
    </form>
  )
}

