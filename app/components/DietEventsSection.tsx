"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { DocumentReference } from "firebase/firestore"

interface DietEvent {
  id: string
  dogId: DocumentReference
  userId: DocumentReference
  createdAt: string
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDietEvents = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/diet-events?dogId=${dogId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch diet events")
      }
      const data = await response.json()
      console.log("Fetched diet events:", data)
      setDietEvents(data)
    } catch (error) {
      console.error("Error fetching diet events:", error)
      setError("Failed to fetch diet events. Please try again later.")
      showToast("Error", "Failed to fetch diet events", true)
    } finally {
      setIsLoading(false)
    }
  }, [dogId, showToast]) // Removed isLoading from the dependency array

  useEffect(() => {
    fetchDietEvents()
  }, [fetchDietEvents])

  const handleDeleteDietEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/diet-events?id=${eventId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete event")
      }
      fetchDietEvents()
      showToast("Diet Event Deleted", "The diet event has been successfully deleted.", false)
    } catch (error) {
      console.error("Error deleting diet event:", error)
      showToast("Error", "There was a problem deleting the diet event.", true)
    }
  }

  if (error) {
    return <div>Error: {error}</div>
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

        {isLoading ? (
          <div>Loading diet events...</div>
        ) : (
          <div className="mt-6 space-y-4">
            {dietEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.foodType}</CardTitle>
                  <CardDescription>
                    {event.createdAt ? format(new Date(event.createdAt), "MMMM d, yyyy HH:mm") : "No date available"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>Brand:</strong> {event.brandName}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {event.quantity} grams
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
        )}
      </CardContent>
    </Card>
  )
}

