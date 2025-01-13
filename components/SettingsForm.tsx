'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { useSignOut } from '@/app/hooks/useSignOut'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function SettingsForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { logout } = useSignOut()
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setEmail(user.email || '')
        const userDocRef = doc(db, 'users', user.uid)
        try {
          const userDoc = await getDoc(userDocRef)
          if (userDoc.exists()) {
            setName(userDoc.data().name || '')
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
        setLoading(false)
      } else if (!loading) {
        // If user is null and we're not in the initial loading state, redirect to login
        router.push('/auth/login')
      }
    }

    fetchUserData()
  }, [user, loading, router])

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  const handleSave = async () => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid)
        await updateDoc(userDocRef, { name })
        console.log('Name updated successfully')
      } catch (error) {
        console.error('Error updating name:', error)
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null // The useEffect will handle redirection
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Settings</CardTitle>
        <CardDescription>Manage your account settings and preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            value={email} 
            placeholder="Enter your email"
            disabled
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/')}>Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
      <div className="mt-6 px-6 pb-6">
        <Button variant="destructive" onClick={handleLogout}>Logout</Button>
      </div>
    </Card>
  )
}

