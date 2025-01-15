'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { format } from 'date-fns'
import { ExerciseEventForm } from '@/app/components/ExerciseEventForm'

interface ExerciseEvent {
  id: string
  dogId: string
  dateTime: Date
  activityType: string
  duration: number
  distance?: number
  source: string
}

interface ExerciseEventsSectionProps {
  dogId: string
  showToast: (title: string, description: string, isError: boolean) => void
}

export function ExerciseEventsSection({ dogId, showToast }: ExerciseEventsSectionProps) {
  const [exerciseEvents, setExerciseEvents] = useState<ExerciseEvent[]>([])
  const [showExerciseEventForm, setShowExerciseEventForm] = useState(false)
  const [editingExerciseEvent, setEditingExerciseEvent] = useState<ExerciseEvent | null>(null)

  const fetchExerciseEvents = useCallback(async () => {
    const dogRef = doc(db, 'dogs', dogId)
    const exerciseEventsQuery = query(collection(db, 'exerciseEvents'), where('dogId', '==', dogRef))
    const querySnapshot = await getDocs(exerciseEventsQuery)
    const eventsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dogId: dogId,
      dateTime: doc.data().dateTime.toDate()
    } as ExerciseEvent))
    setExerciseEvents(eventsData)
  }, [dogId])

  useEffect(() => {
    fetchExerciseEvents()
  }, [fetchExerciseEvents])

  const handleEditExerciseEvent = (event: ExerciseEvent) => {
    setEditingExerciseEvent(event)
    setShowExerciseEventForm(true)
  }

  const handleDeleteExerciseEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'exerciseEvents', eventId))
      fetchExerciseEvents()
      showToast('Exercise Event Deleted', 'The exercise event has been successfully deleted.', false)
    } catch (error) {
      console.error('Error deleting exercise event:', error)
      showToast('Error', 'There was a problem deleting the exercise event.', true)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Events</CardTitle>
        <CardDescription>Manage your dog&apos;s exercise events</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => {
          setEditingExerciseEvent(null)
          setShowExerciseEventForm(!showExerciseEventForm)
        }}>
          {showExerciseEventForm && !editingExerciseEvent ? 'Cancel' : 'Add Exercise Event'}
        </Button>

        {showExerciseEventForm && (
          <ExerciseEventForm
            dogId={dogId}
            event={editingExerciseEvent || undefined}
            onSuccess={() => {
              setShowExerciseEventForm(false)
              setEditingExerciseEvent(null)
              fetchExerciseEvents()
              showToast(
                editingExerciseEvent ? 'Exercise Event Updated' : 'Exercise Event Added',
                `The exercise event has been successfully ${editingExerciseEvent ? 'updated' : 'added'}.`,
                false
              )
            }}
            onCancel={() => {
              setShowExerciseEventForm(false)
              setEditingExerciseEvent(null)
            }}
          />
        )}

        <div className="mt-6 space-y-4">
          {exerciseEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.activityType}</CardTitle>
                <CardDescription>{format(event.dateTime, 'MMMM d, yyyy HH:mm')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p><strong>Duration:</strong> {event.duration} minutes</p>
                {event.distance && <p><strong>Distance:</strong> {event.distance} km</p>}
                <p><strong>Source:</strong> {event.source}</p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleEditExerciseEvent(event)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDeleteExerciseEvent(event.id)}>Delete</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

