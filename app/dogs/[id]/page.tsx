'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/app/contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"

interface Dog {
  id: string
  name: string
  breed: string
  age: number
  sex: string
  weight: number
}

type DogUpdateData = Omit<Dog, 'id'>

export default function DogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [dog, setDog] = useState<Dog | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', isError: false })
  const router = useRouter()
  const { user } = useAuth()

  const fetchDog = useCallback(async () => {
    if (!user) return
    const dogDoc = await getDoc(doc(db, 'dogs', id))
    if (dogDoc.exists()) {
      setDog({ id: dogDoc.id, ...dogDoc.data() } as Dog)
    } else {
      router.push('/dogs')
    }
  }, [user, id, router])

  useEffect(() => {
    if (user) {
      fetchDog()
    }
  }, [user, fetchDog])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dog) return
    
    const updateData: DogUpdateData = {
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      sex: dog.sex,
      weight: dog.weight
    }

    try {
      await updateDoc(doc(db, 'dogs', dog.id), updateData)
      setIsEditing(false)
      showToast('Dog Updated', 'Your dog\'s information has been successfully updated.', false)
    } catch (error) {
      console.error('Error updating dog:', error)
      showToast('Error', 'There was a problem updating your dog\'s information.', true)
    }
  }

  const handleDelete = async () => {
    if (!dog) return
    try {
      await deleteDoc(doc(db, 'dogs', dog.id))
      router.push('/dogs')
    } catch (error) {
      console.error('Error deleting dog:', error)
      showToast('Error', 'There was a problem deleting your dog.', true)
    }
  }

  const showToast = (title: string, description: string, isError: boolean = false) => {
    setToastMessage({ title, description, isError })
    setToastOpen(true)
  }

  if (!dog) {
    return <div>Loading...</div>
  }

  return (
    <ToastProvider>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Dog Information' : 'Dog Information'}</CardTitle>
          <CardDescription>{isEditing ? 'Update your dog\'s details below' : 'View your dog\'s details'}</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={dog.name}
                  onChange={(e) => setDog({ ...dog, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed">Breed</Label>
                <Input
                  id="breed"
                  value={dog.breed}
                  onChange={(e) => setDog({ ...dog, breed: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={dog.age}
                  onChange={(e) => setDog({ ...dog, age: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex">Sex</Label>
                <Select onValueChange={(value) => setDog({ ...dog, sex: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={dog.sex} />
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
                  value={dog.weight}
                  onChange={(e) => setDog({ ...dog, weight: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <Button type="submit">Update Dog</Button>
            </form>
          ) : (
            <div className="space-y-2">
              <p><strong>Name:</strong> {dog.name}</p>
              <p><strong>Breed:</strong> {dog.breed}</p>
              <p><strong>Age:</strong> {dog.age}</p>
              <p><strong>Sex:</strong> {dog.sex}</p>
              <p><strong>Weight:</strong> {dog.weight} lbs</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          )}
          <Button variant="destructive" onClick={handleDelete}>Delete Dog</Button>
        </CardFooter>
      </Card>
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

