'use client'

import { useState } from 'react'
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { GoogleLogo } from '@/components/GoogleLogo'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', isError: false })
  const router = useRouter()

  const showToast = (title: string, description: string, isError: boolean = false) => {
    setToastMessage({ title, description, isError })
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const createUserDocument = async (userId: string, name: string, email: string) => {
    await setDoc(doc(db, 'users', userId), {
      name,
      email,
      createdAt: new Date(),
    })
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update user profile
      await updateProfile(user, { displayName: name })

      // Create user document in Firestore
      await createUserDocument(user.uid, name, email)

      showToast('Sign Up Successful', 'Your account has been created.', false)
      router.push('/')
    } catch (error) {
      console.error('Error signing up:', error)
      showToast('Sign Up Failed', 'There was an error creating your account.', true)
    }
  }

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Create user document in Firestore
      await createUserDocument(user.uid, user.displayName || 'Google User', user.email || '')

      showToast('Sign Up Successful', 'Your account has been created with Google.', false)
      router.push('/')
    } catch (error) {
      console.error('Error signing up with Google:', error)
      showToast('Sign Up Failed', 'There was an error creating your account with Google.', true)
    }
  }

  return (
    <ToastProvider>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create a new account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
              <Button type="submit" className="w-full">Sign Up</Button>
            </form>
            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={handleGoogleSignUp}>
                <GoogleLogo className="mr-2 h-5 w-5" />
                Sign up with Google
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-center w-full">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-500 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      <Toast open={toastOpen} onOpenChange={setToastOpen}>
        <div className={`${toastMessage.isError ? 'bg-red-100 border-red-400' : 'bg-green-100 border-green-400'} border-l-4 p-4`}>
          <ToastTitle className={`${toastMessage.isError ? 'text-red-800' : 'text-green-800'} font-bold`}>{toastMessage.title}</ToastTitle>
          <ToastDescription className={`${toastMessage.isError ? 'text-red-700' : 'text-green-700'}`}>{toastMessage.description}</ToastDescription>
        </div>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  )
}

