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

interface WellnessEvent {
  id: string
  dogId: DocumentReference
  userId: DocumentReference
  eventDate: Date
  type: "wellness"
  mentalState: string
  notes: string
  severity: number
}

interface WellnessEventsSectionProps {
  dogId: string
  showToast: (title: string, description: string, isError: boolean) => void
}

export function WellnessEventsSection({ dogId, showToast }: WellnessEventsSectionProps) {
  const router = useRouter()
  const [wellnessEvents, setWellnessEvents] = useState<WellnessEvent[]>([])

  const fetchWellnessEvents = useCallback(async () => {
    const dogRef = doc(db, "dogs", dogId)
    const wellnessEventsQuery = query(collection(db, "wellnessEvents"), where("dogId", "==", dogRef))
    const querySnapshot = await getDocs(wellnessEventsQuery)
    const eventsData = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate() : new Date(),
      } as WellnessEvent
    })
    console.log("Fetched wellness events:", eventsData)
    setWellnessEvents(eventsData)
  }, [dogId])

  useEffect(() => {
    fetchWellnessEvents()
  }, [fetchWellnessEvents])

  const handleDeleteWellnessEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, "wellnessEvents", eventId))
      fetchWellnessEvents()
      showToast("Wellness Event Deleted", "The wellness event has been successfully deleted.", false)
    } catch (error) {
      console.error("Error deleting wellness event:", error)
      showToast("Error", "There was a problem deleting the wellness event.", true)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wellness Events</CardTitle>
        <CardDescription>Manage your dog&apos;s wellness events</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => {
            router.push(`/health-wellness/wellness/add?dogId=${dogId}`)
          }}
        >
          Add Wellness Event
        </Button>

        <div className="mt-6 space-y-4">
          {wellnessEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.mentalState}</CardTitle>
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
                <Link href={`/health-wellness/wellness/${event.id}`} passHref>
                  <Button variant="outline">View / Edit</Button>
                </Link>
                <Button variant="destructive" onClick={() => handleDeleteWellnessEvent(event.id)}>
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

