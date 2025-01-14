'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { format } from 'date-fns'
import { BehaviorEventForm } from '@/app/components/BehaviorEventForm'

interface BehaviorEvent {
  id: string
  dogId: string
  dateTime: Date
  behaviorType: string
  severityLevel: 'mild' | 'moderate' | 'severe'
  notes: string
}

interface BehaviorEventsSectionProps {
  dogId: string
  showToast: (title: string, description: string, isError: boolean) => void
}

export function BehaviorEventsSection({ dogId, showToast }: BehaviorEventsSectionProps) {
  const [behaviorEvents, setBehaviorEvents] = useState<BehaviorEvent[]>([])
  const [showBehaviorEventForm, setShowBehaviorEventForm] = useState(false)
  const [editingBehaviorEvent, setEditingBehaviorEvent] = useState<BehaviorEvent | null>(null)

  const fetchBehaviorEvents = useCallback(async () => {
    const dogRef = doc(db, 'dogs', dogId)
    const behaviorEventsQuery = query(collection(db, 'behaviorEvents'), where('dogId', '==', dogRef))
    const querySnapshot = await getDocs(behaviorEventsQuery)
    const eventsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dogId: dogId,
      dateTime: doc.data().dateTime.toDate()
    } as BehaviorEvent))
    setBehaviorEvents(eventsData)
  }, [dogId])

  useEffect(() => {
    fetchBehaviorEvents()
  }, [fetchBehaviorEvents])

  const handleEditBehaviorEvent = (event: BehaviorEvent) => {
    setEditingBehaviorEvent(event)
    setShowBehaviorEventForm(true)
  }

  const handleDeleteBehaviorEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'behaviorEvents', eventId))
      fetchBehaviorEvents()
      showToast('Behavior Event Deleted', 'The behavior event has been successfully deleted.', false)
    } catch (error) {
      console.error('Error deleting behavior event:', error)
      showToast('Error', 'There was a problem deleting the behavior event.', true)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Behavior Events</CardTitle>
        <CardDescription>Manage your dog's behavior events</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => {
          setEditingBehaviorEvent(null)
          setShowBehaviorEventForm(!showBehaviorEventForm)
        }}>
          {showBehaviorEventForm && !editingBehaviorEvent ? 'Cancel' : 'Add Behavior Event'}
        </Button>

        {showBehaviorEventForm && (
          <BehaviorEventForm
            dogId={dogId}
            event={editingBehaviorEvent || undefined}
            onSuccess={() => {
              setShowBehaviorEventForm(false)
              setEditingBehaviorEvent(null)
              fetchBehaviorEvents()
              showToast(
                editingBehaviorEvent ? 'Behavior Event Updated' : 'Behavior Event Added',
                `The behavior event has been successfully ${editingBehaviorEvent ? 'updated' : 'added'}.`,
                false
              )
            }}
            onCancel={() => {
              setShowBehaviorEventForm(false)
              setEditingBehaviorEvent(null)
            }}
          />
        )}

        <div className="mt-6 space-y-4">
          {behaviorEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.behaviorType}</CardTitle>
                <CardDescription>{format(event.dateTime, 'MMMM d, yyyy HH:mm')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{event.notes}</p>
                <p><strong>Severity:</strong> {event.severityLevel}</p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleEditBehaviorEvent(event)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDeleteBehaviorEvent(event.id)}>Delete</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

