'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { format } from 'date-fns'
import { HealthEventForm } from '@/app/components/HealthEventForm'

interface HealthEvent {
  id: string
  dogId: string
  eventType: string
  eventDate: Date
  notes: string
  severity?: 'mild' | 'moderate' | 'severe'
}

interface HealthEventsSectionProps {
  dogId: string
  showToast: (title: string, description: string, isError: boolean) => void
}

export function HealthEventsSection({ dogId, showToast }: HealthEventsSectionProps) {
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([])
  const [showHealthEventForm, setShowHealthEventForm] = useState(false)
  const [editingHealthEvent, setEditingHealthEvent] = useState<HealthEvent | null>(null)

  const fetchHealthEvents = useCallback(async () => {
    const dogRef = doc(db, 'dogs', dogId)
    const healthEventsQuery = query(collection(db, 'healthEvents'), where('dogId', '==', dogRef))
    const querySnapshot = await getDocs(healthEventsQuery)
    const eventsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dogId: dogId,
      eventDate: doc.data().eventDate.toDate()
    } as HealthEvent))
    setHealthEvents(eventsData)
  }, [dogId])

  useEffect(() => {
    fetchHealthEvents()
  }, [fetchHealthEvents])

  const handleEditHealthEvent = (event: HealthEvent) => {
    setEditingHealthEvent(event)
    setShowHealthEventForm(true)
  }

  const handleDeleteHealthEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'healthEvents', eventId))
      fetchHealthEvents()
      showToast('Health Event Deleted', 'The health event has been successfully deleted.', false)
    } catch (error) {
      console.error('Error deleting health event:', error)
      showToast('Error', 'There was a problem deleting the health event.', true)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Events</CardTitle>
        <CardDescription>Manage your dog&apos;s health events</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => {
          setEditingHealthEvent(null)
          setShowHealthEventForm(!showHealthEventForm)
        }}>
          {showHealthEventForm && !editingHealthEvent ? 'Cancel' : 'Add Health Event'}
        </Button>

        {showHealthEventForm && (
          <HealthEventForm
            dogId={dogId}
            event={editingHealthEvent || undefined}
            onSuccess={() => {
              setShowHealthEventForm(false)
              setEditingHealthEvent(null)
              fetchHealthEvents()
              showToast(
                editingHealthEvent ? 'Health Event Updated' : 'Health Event Added',
                `The health event has been successfully ${editingHealthEvent ? 'updated' : 'added'}.`,
                false
              )
            }}
            onCancel={() => {
              setShowHealthEventForm(false)
              setEditingHealthEvent(null)
            }}
          />
        )}

        <div className="mt-6 space-y-4">
          {healthEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.eventType}</CardTitle>
                <CardDescription>{format(event.eventDate, 'MMMM d, yyyy')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{event.notes}</p>
                {event.severity && <p><strong>Severity:</strong> {event.severity}</p>}
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleEditHealthEvent(event)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDeleteHealthEvent(event.id)}>Delete</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

