'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/app/contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { format } from 'date-fns'
import { BehaviorEventForm } from '@/app/components/BehaviorEventForm'

interface BehaviorEvent {
  id: string
  dogId: string
  dogName: string
  dateTime: Date
  behaviorType: string
  severityLevel: 'mild' | 'moderate' | 'severe'
  notes: string
}

export default function BehaviorPage() {
  const [behaviorEvents, setBehaviorEvents] = useState<BehaviorEvent[]>([])
  const [editingEvent, setEditingEvent] = useState<BehaviorEvent | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', isError: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchBehaviorEvents = async () => {
      try {
        setLoading(true)
        setError(null)
        if (!user) return
        console.log('User:', user?.uid);
        // First, fetch the user's dogs
        const dogsQuery = query(collection(db, 'dogs'), where('users', 'array-contains', user.uid))
        const dogsSnapshot = await getDocs(dogsQuery)
        const userDogIds = dogsSnapshot.docs.map(doc => doc.id)
        console.log('User dogs:', userDogIds);

        // Then, fetch behavior events for these dogs
        const eventsQuery = query(collection(db, 'behaviorEvents'), where('dogId', 'in', userDogIds.map(id => doc(db, 'dogs', id))))
        const querySnapshot = await getDocs(eventsQuery)
        const eventsData = querySnapshot.docs.map(doc => {
          const eventData = doc.data()
          return {
            id: doc.id,
            ...eventData,
            dogName: 'Unknown Dog', // We'll update this later
            dateTime: eventData.dateTime.toDate(),
            dogId: eventData.dogId.id
          } as BehaviorEvent
        })

        // Now, let's fetch the dog names
        const dogNames = await Promise.all(userDogIds.map(async (dogId) => {
          const dogDoc = await getDoc(doc(db, 'dogs', dogId))
          return { id: dogId, name: dogDoc.data()?.name || 'Unknown Dog' }
        }))

        // Update the events with the correct dog names
        const eventsWithDogNames = eventsData.map(event => ({
          ...event,
          dogName: dogNames.find(dog => dog.id === event.dogId)?.name || 'Unknown Dog'
        }))

        console.log('Fetched behavior events:', eventsWithDogNames)
        setBehaviorEvents(eventsWithDogNames)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching behavior events:', err)
        setError('Failed to fetch behavior events')
        setLoading(false)
      }
    }

    fetchBehaviorEvents()
  }, [user])

  const showToast = (title: string, description: string, isError: boolean = false) => {
    setToastMessage({ title, description, isError })
    setToastOpen(true)
    
    setTimeout(() => {
      setToastOpen(false)
    }, 2000)
  }

  const handleDelete = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'behaviorEvents', eventId))
      setBehaviorEvents(behaviorEvents.filter(event => event.id !== eventId))
      showToast('Behavior Event Deleted', 'The behavior event has been successfully deleted.', false)
    } catch (error) {
      console.error('Error deleting behavior event:', error)
      showToast('Error', 'There was a problem deleting the behavior event.', true)
    }
  }

  return (
    <ToastProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Behavior Events</h1>
          <Link href="/behavior/add">
            <Button>Add Behavior Log</Button>
          </Link>
        </div>

        {loading && <p>Loading behavior events...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && behaviorEvents.length === 0 && (
          <p>No behavior events found. Add some events to get started!</p>
        )}
        {behaviorEvents.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.behaviorType}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Dog:</strong> {event.dogName}</p>
              <p><strong>Date:</strong> {format(event.dateTime, 'MMMM d, yyyy HH:mm')}</p>
              <p><strong>Severity:</strong> {event.severityLevel}</p>
              <p><strong>Notes:</strong> {event.notes}</p>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingEvent(event)}>Edit</Button>
              <Button variant="destructive" onClick={() => handleDelete(event.id)}>Delete</Button>
            </CardFooter>
          </Card>
        ))}

        {editingEvent && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Behavior Event</CardTitle>
            </CardHeader>
            <CardContent>
              <BehaviorEventForm
                dogId={editingEvent.dogId}
                event={editingEvent}
                onSuccess={() => {
                  setEditingEvent(null)
                  showToast('Behavior Event Updated', 'The behavior event has been successfully updated.', false)
                  router.refresh()
                }}
                onCancel={() => setEditingEvent(null)}
              />
            </CardContent>
          </Card>
        )}
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

