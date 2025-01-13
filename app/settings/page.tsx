'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from '../contexts/AuthContext'
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { useLogout } from '../utils/auth'
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Dog {
  id: string
  name: string
  breed: string
}

export default function Settings() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [dogs, setDogs] = useState<Dog[]>([])
  const { user } = useAuth()
  const router = useRouter()
  const { handleLogout, toastOpen, setToastOpen, toastMessage, showToast } = useLogout()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else {
      fetchDogs()
      fetchUserData()
    }
  }, [user, router])

  const fetchDogs = async () => {
    if (!user) return
    const dogsQuery = query(collection(db, 'dogs'), where('users', 'array-contains', user.uid))
    const querySnapshot = await getDocs(dogsQuery)
    const dogsData = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name, breed: doc.data().breed } as Dog))
    setDogs(dogsData)
  }

  const fetchUserData = async () => {
    if (!user) return
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      setName(userData.name || '')
      setEmail(userData.email || '')
    }
  }

  const handleSaveChanges = async () => {
    if (!user) return
    try {
      await updateDoc(doc(db, 'users', user.uid), { name, email })
      showToast('Settings Updated', 'Your settings have been successfully updated.', false)
    } catch (error) {
      showToast('Error', 'There was a problem updating your settings.', true)
    }
  }

  if (!user) {
    return null
  }

  return (
    <ToastProvider>
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Manage My Dogs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {dogs.map((dog) => (
                    <Link href={`/dogs/${dog.id}`} key={dog.id}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">{dog.name}</CardTitle>
                          <CardDescription>{dog.breed}</CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
                <Link href="/dogs" className="inline-block">
                  <Button>View All Dogs</Button>
                </Link>
              </CardContent>
            </Card>

            <div className="mt-6">
              <Button variant="destructive" onClick={handleLogout}>Logout</Button>
            </div>
          </div>
        </main>
        <Toast open={toastOpen} onOpenChange={setToastOpen}>
          <div className={`${toastMessage.isError ? 'bg-red-100 border-red-400' : 'bg-green-100 border-green-400'} border-l-4 p-4`}>
            <ToastTitle className={`${toastMessage.isError ? 'text-red-800' : 'text-green-800'} font-bold`}>{toastMessage.title}</ToastTitle>
            <ToastDescription className={`${toastMessage.isError ? 'text-red-700' : 'text-green-700'}`}>{toastMessage.description}</ToastDescription>
          </div>
        </Toast>
        <ToastViewport />
      </div>
    </ToastProvider>
  )
}

