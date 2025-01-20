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
import HealthEventForm from "@/app/components/HealthEventForm" // Updated import statement

interface HealthEvent {
  id: string
  dogId: DocumentReference
  userId: DocumentReference
  eventDate: Date // Removed optional modifier
  type: "health"
  eventType: string
  notes: string
  severity: number
}

interface HealthEventsSectionProps {
  dogId: string
  showToast: (title: string, description: string, isError: boolean) => void
}

export function HealthEventsSection({ dogId, showToast }: HealthEventsSectionProps) {
  const router = useRouter()
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([])
  //const [showHealthEventForm, setShowHealthEventForm] = useState(false) //Removed
  //const [editingHealthEvent, setEditingHealthEvent] = useState<HealthEvent | null>(null) //Removed

  const fetchHealthEvents = useCallback(async () => {
    const dogRef = doc(db, "dogs", dogId)
    const healthEventsQuery = query(collection(db, "healthEvents"), where("dogId", "==", dogRef))
    const querySnapshot = await getDocs(healthEventsQuery)
    const eventsData = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate() : new Date(),
      } as HealthEvent
    })
    console.log("Fetched health events:", eventsData) // Add this line for debugging
    setHealthEvents(eventsData)
  }, [dogId])

  useEffect(() => {
    fetchHealthEvents()
  }, [fetchHealthEvents])

  const handleEditHealthEvent = (event: HealthEvent) => {
    //setEditingHealthEvent(event) //Removed
    //setShowHealthEventForm(true) //Removed
    router.push(`/health-wellness/edit?id=${event.id}`) //Added
  }

  const handleDeleteHealthEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, "healthEvents", eventId))
      fetchHealthEvents()
      showToast("Health Event Deleted", "The health event has been successfully deleted.", false)
    } catch (error) {
      console.error("Error deleting health event:", error)
      showToast("Error", "There was a problem deleting the health event.", true)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Events</CardTitle>
        <CardDescription>Manage your dog&apos;s health events</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => {
            router.push(`/health-wellness/add?dogId=${dogId}`)
          }}
        >
          Add Health Event
        </Button>

        {/*Removed showHealthEventForm and HealthEventForm related code */}

        <div className="mt-6 space-y-4">
          {healthEvents.map((event) => (
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
                <Button variant="outline" onClick={() => handleEditHealthEvent(event)}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteHealthEvent(event.id)}>
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

