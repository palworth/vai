'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"

interface NewDog {
  name: string
  breed: string
  age: number
  sex: string
  weight: number
}

export default function AddDogPage() {
  const [newDog, setNewDog] = useState<NewDog>({ name: '', breed: '', age: 0, sex: '', weight: 0 })
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', isError: false })
  const router = useRouter()
  const { user } = useAuth()

  const handleAddDog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      await addDoc(collection(db, 'dogs'), {
        ...newDog,
        users: [user.uid]
      })
      showToast('Dog Added', 'Your new dog has been successfully added.', false)
      setTimeout(() => router.push('/dogs'), 2000)
    } catch (error) {
      console.error('Error adding dog:', error)
      showToast('Error', 'There was a problem adding your dog.', true)
    }
  }

  const showToast = (title: string, description: string, isError: boolean = false) => {
    setToastMessage({ title, description, isError })
    setToastOpen(true)
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Add New Dog</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Add New Dog</CardTitle>
              <CardDescription>Enter your dog&apos;s information below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddDog} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newDog.name}
                    onChange={(e) => setNewDog({ ...newDog, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    value={newDog.breed}
                    onChange={(e) => setNewDog({ ...newDog, breed: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={newDog.age}
                    onChange={(e) => setNewDog({ ...newDog, age: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex">Sex</Label>
                  <Select onValueChange={(value) => setNewDog({ ...newDog, sex: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={newDog.weight}
                    onChange={(e) => setNewDog({ ...newDog, weight: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <Button type="submit">Add Dog</Button>
              </form>
            </CardContent>
          </Card>
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

