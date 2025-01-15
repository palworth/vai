'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { format } from 'date-fns'
import { DietEventForm } from '@/app/components/DietEventForm'

interface DietEvent {
  id: string
  dogId: string
  dateTime: Date
  foodType: 'raw' | 'dry' | 'specialty'
  brandName?: string
  quantity: number
}

interface DietEventsSectionProps {
  dogId: string
  showToast: (title: string, description: string, isError: boolean) => void
}

export function DietEventsSection({ dogId, showToast }: DietEventsSectionProps) {
  const [dietEvents, setDietEvents] = useState<DietEvent[]>([])
  const [showDietEventForm, setShowDietEventForm] = useState(false)
  const [editingDietEvent, setEditingDietEvent] = useState<DietEvent | null>(null)

  const fetchDietEvents = useCallback(async () => {
    const dogRef = doc(db, 'dogs', dogId)
    const dietEventsQuery = query(collection(db, 'dietEvents'), where('dogId', '==', dogRef))
    const querySnapshot = await getDocs(dietEventsQuery)
    const eventsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dogId: dogId,
      dateTime: doc.data().dateTime.toDate()
    } as DietEvent))
    setDietEvents(eventsData)
  }, [dogId])

  useEffect(() => {
    fetchDietEvents()
  }, [fetchDietEvents])

  const handleEditDietEvent = (event: DietEvent) => {
    setEditingDietEvent(event)
    setShowDietEventForm(true)
  }

  const handleDeleteDietEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'dietEvents', eventId))
      fetchDietEvents()
      showToast('Diet Event Deleted', 'The diet event has been successfully deleted.', false)
    } catch (error) {
      console.error('Error deleting diet event:', error)
      showToast('Error', 'There was a problem deleting the diet event.', true)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diet Events</CardTitle>
        <CardDescription>Manage your dog&apos;s diet events</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => {
          setEditingDietEvent(null)
          setShowDietEventForm(!showDietEventForm)
        }}>
          {showDietEventForm && !editingDietEvent ? 'Cancel' : 'Add Diet Event'}
        </Button>

        {showDietEventForm && (
          <DietEventForm
            dogId={dogId}
            event={editingDietEvent || undefined}
            onSuccess={() => {
              setShowDietEventForm(false)
              setEditingDietEvent(null)
              fetchDietEvents()
              showToast(
                editingDietEvent ? 'Diet Event Updated' : 'Diet Event Added',
                `The diet event has been successfully ${editingDietEvent ? 'updated' : 'added'}.`,
                false
              )
            }}
            onCancel={() => {
              setShowDietEventForm(false)
              setEditingDietEvent(null)
            }}
          />
        )}

        <div className="mt-6 space-y-4">
          {dietEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.foodType} Food</CardTitle>
                <CardDescription>{format(event.dateTime, 'MMMM d, yyyy HH:mm')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p><strong>Quantity:</strong> {event.quantity} grams/cups</p>
                {event.brandName && <p><strong>Brand:</strong> {event.brandName}</p>}
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleEditDietEvent(event)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDeleteDietEvent(event.id)}>Delete</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

