'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { useSignOut } from '@/app/hooks/useSignOut'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'

export default function Settings() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const { user } = useAuth()
  const { logout } = useSignOut()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '')
      setEmail(user.email || '')
    }
  }, [user])

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Save changes:', { displayName, email })
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>User Settings</CardTitle>
              <CardDescription>Manage your account settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input 
                  id="displayName" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push('/')}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
          </Card>
          <div className="mt-6">
            <Button variant="destructive" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </main>
    </div>
  )
}

