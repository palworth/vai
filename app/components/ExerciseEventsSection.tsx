"use client"

import { useState, useEffect, useCallback } from "react"
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  type DocumentReference,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ExerciseEvent {
  id: string
  dogId: DocumentReference
  userId: DocumentReference
  eventDate: Date
  type: "exercise"
  duration: number
  distance: number
  source: string
  activityType: string
}

interface ExerciseEventsSectionProps {
  dogId: string
  showToast: (title: string, description: string, isError: boolean) => void
}

export function ExerciseEventsSection({ dogId, showToast }: ExerciseEventsSectionProps) {
  const router = useRouter()
  const [exerciseEvents, setExerciseEvents] = useState<ExerciseEvent[]>([])

  const fetchExerciseEvents = useCallback(async () => {
    const dogRef = doc(db, "dogs", dogId)
    const exerciseEventsQuery = query(collection(db, "exerciseEvents"), where("dogId", "==", dogRef))
    const querySnapshot = await getDocs(exerciseEventsQuery)
    const eventsData = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate() : new Date(),
      } as ExerciseEvent
    })
    console.log("Fetched exercise events:", eventsData)
    setExerciseEvents(eventsData)
  }, [dogId])

  useEffect(() => {
    fetchExerciseEvents()
  }, [fetchExerciseEvents])

  const handleDeleteExerciseEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, "exerciseEvents", eventId))
      fetchExerciseEvents()
      showToast("Exercise Event Deleted", "The exercise event has been successfully deleted.", false)
    } catch (error) {
      console.error("Error deleting exercise event:", error)
      showToast("Error", "There was a problem deleting the exercise event.", true)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Events</CardTitle>
        <CardDescription>Manage your dog&apos;s exercise events</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => {
            router.push(`/diet-exercise/exercise/add?dogId=${dogId}`)
          }}
        >
          Add Exercise Event
        </Button>

        <div className="mt-6 space-y-4">
          {exerciseEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.activityType}</CardTitle>
                <CardDescription>
                  {event.eventDate ? format(event.eventDate, "MMMM d, yyyy HH:mm") : "No date available"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Duration:</strong> {event.duration} minutes
                </p>
                <p>
                  <strong>Distance:</strong> {event.distance} miles
                </p>
                <p>
                  <strong>Source:</strong> {event.source}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Link href={`/diet-exercise/exercise/${event.id}`} passHref>
                  <Button variant="outline">View / Edit</Button>
                </Link>
                <Button variant="destructive" onClick={() => handleDeleteExerciseEvent(event.id)}>
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

