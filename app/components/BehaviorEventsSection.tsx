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

interface BehaviorEvent {
  id: string
  dogId: DocumentReference
  userId: DocumentReference
  eventDate: Date
  type: "behavior"
  eventType: string
  notes: string
  severity: number
}

interface BehaviorEventsSectionProps {
  dogId: string
  showToast: (title: string, description: string, isError: boolean) => void
}

export function BehaviorEventsSection({ dogId, showToast }: BehaviorEventsSectionProps) {
  const router = useRouter()
  const [behaviorEvents, setBehaviorEvents] = useState<BehaviorEvent[]>([])

  const fetchBehaviorEvents = useCallback(async () => {
    const dogRef = doc(db, "dogs", dogId)
    const behaviorEventsQuery = query(collection(db, "behaviorEvents"), where("dogId", "==", dogRef))
    const querySnapshot = await getDocs(behaviorEventsQuery)
    const eventsData = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate() : new Date(),
      } as BehaviorEvent
    })
    console.log("Fetched behavior events:", eventsData)
    setBehaviorEvents(eventsData)
  }, [dogId])

  useEffect(() => {
    fetchBehaviorEvents()
  }, [fetchBehaviorEvents])

  const handleDeleteBehaviorEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, "behaviorEvents", eventId))
      fetchBehaviorEvents()
      showToast("Behavior Event Deleted", "The behavior event has been successfully deleted.", false)
    } catch (error) {
      console.error("Error deleting behavior event:", error)
      showToast("Error", "There was a problem deleting the behavior event.", true)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Behavior Events</CardTitle>
        <CardDescription>Manage your dog&apos;s behavior events</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => {
            router.push(`/behavior/add?dogId=${dogId}`)
          }}
        >
          Add Behavior Event
        </Button>

        <div className="mt-6 space-y-4">
          {behaviorEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.eventType}</CardTitle>
                <CardDescription>
                  {event.eventDate ? format(event.eventDate, "MMMM d, yyyy HH:mm") : "No date available"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Severity:</strong> {event.severity}/10
                </p>
                <p>
                  <strong>Notes:</strong> {event.notes}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Link href={`/behavior/${event.id}`} passHref>
                  <Button variant="outline">View / Edit</Button>
                </Link>
                <Button variant="destructive" onClick={() => handleDeleteBehaviorEvent(event.id)}>
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

