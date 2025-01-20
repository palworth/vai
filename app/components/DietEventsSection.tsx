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

interface DietEvent {
  id: string
  dogId: DocumentReference
  userId: DocumentReference
  eventDate: Date
  type: "diet"
  foodType: string
  brandName: string
  quantity: number
}

interface DietEventsSectionProps {
  dogId: string
  showToast: (title: string, description: string, isError: boolean) => void
}

export function DietEventsSection({ dogId, showToast }: DietEventsSectionProps) {
  const router = useRouter()
  const [dietEvents, setDietEvents] = useState<DietEvent[]>([])

  const fetchDietEvents = useCallback(async () => {
    const dogRef = doc(db, "dogs", dogId)
    const dietEventsQuery = query(collection(db, "dietEvents"), where("dogId", "==", dogRef))
    const querySnapshot = await getDocs(dietEventsQuery)
    const eventsData = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate() : new Date(),
      } as DietEvent
    })
    console.log("Fetched diet events:", eventsData)
    setDietEvents(eventsData)
  }, [dogId])

  useEffect(() => {
    fetchDietEvents()
  }, [fetchDietEvents])

  const handleDeleteDietEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, "dietEvents", eventId))
      fetchDietEvents()
      showToast("Diet Event Deleted", "The diet event has been successfully deleted.", false)
    } catch (error) {
      console.error("Error deleting diet event:", error)
      showToast("Error", "There was a problem deleting the diet event.", true)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diet Events</CardTitle>
        <CardDescription>Manage your dog&apos;s diet events</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => {
            router.push(`/diet-exercise/diet/add?dogId=${dogId}`)
          }}
        >
          Add Diet Event
        </Button>

        <div className="mt-6 space-y-4">
          {dietEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.foodType}</CardTitle>
                <CardDescription>
                  {event.eventDate ? format(event.eventDate, "MMMM d, yyyy HH:mm") : "No date available"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Brand:</strong> {event.brandName || "N/A"}
                </p>
                <p>
                  <strong>Quantity:</strong> {event.quantity}g
                </p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Link href={`/diet-exercise/diet/${event.id}`} passHref>
                  <Button variant="outline">View / Edit</Button>
                </Link>
                <Button variant="destructive" onClick={() => handleDeleteDietEvent(event.id)}>
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

