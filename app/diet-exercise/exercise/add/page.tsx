'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { collection, query, where, getDocs, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/app/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { ExerciseEventForm } from '@/app/components/ExerciseEventForm'
import { PageHeader } from '@/components/PageHeader'

interface Dog {
  id: string
  name: string
}

export default function AddExerciseEventPage() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', isError: false })
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchDogs = async () => {
      if (!user) return
      const dogsQuery = query(collection(db, 'dogs'), where('users', 'array-contains', doc(db, 'users', user.uid)))
      const querySnapshot = await getDocs(dogsQuery)
      const dogsData = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Dog))
      setDogs(dogsData)
    }

    fetchDogs()
  }, [user])

  const showToast = (title: string, description: string, isError: boolean = false) => {
    setToastMessage({ title, description, isError })
    setToastOpen(true)
    
    setTimeout(() => {
      setToastOpen(false)
    }, 2000)
  }

  const handleSuccess = () => {
    showToast('Exercise Event Added', 'The exercise event has been successfully added.', false)
    setTimeout(() => {
      router.push('/diet-exercise')
    }, 2000)
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100">
        <PageHeader title="Add Exercise Event" />
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Add New Exercise Event</CardTitle>
              <CardDescription>Select a dog and enter the exercise event details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Select onValueChange={(value) => setSelectedDogId(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a dog" />
                  </SelectTrigger>
                  <SelectContent>
                    {dogs.map((dog) => (
                      <SelectItem key={dog.id} value={dog.id}>{dog.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedDogId && (
                <ExerciseEventForm
                  dogId={selectedDogId}
                  onSuccess={handleSuccess}
                  onCancel={() => router.push('/diet-exercise')}
                />
              )}
            </CardContent>
          </Card>
        </main>
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

