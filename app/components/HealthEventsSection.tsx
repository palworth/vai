"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { DocumentReference } from "firebase/firestore"

interface HealthEvent {
  id: string
  dogId: DocumentReference
  userId: DocumentReference
  eventDate: string
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHealthEvents = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/health-events?dogId=${dogId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch health events")
      }
      const data = await response.json()
      console.log("Fetched health events:", data)
      setHealthEvents(data)
    } catch (error) {
      console.error("Error fetching health events:", error)
      setError("Failed to fetch health events. Please try again later.")
      showToast("Error", "Failed to fetch health events", true)
    } finally {
      setIsLoading(false)
    }
  }, [dogId, showToast])

  useEffect(() => {
    fetchHealthEvents()
  }, [fetchHealthEvents])

  const handleDeleteHealthEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/health-events?id=${eventId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete event")
      }
      fetchHealthEvents()
      showToast("Health Event Deleted", "The health event has been successfully deleted.", false)
    } catch (error) {
      console.error("Error deleting health event:", error)
      showToast("Error", "There was a problem deleting the health event.", true)
    }
  }

  if (error) {
    return <div>Error: {error}</div>
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
            router.push(`/health-wellness/health/add?dogId=${dogId}`)
          }}
        >
          Add Health Event
        </Button>

        {isLoading ? (
          <div>Loading health events...</div>
        ) : (
          <div className="mt-6 space-y-4">
            {healthEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.eventType}</CardTitle>
                  <CardDescription>
                    {event.eventDate ? format(new Date(event.eventDate), "MMMM d, yyyy HH:mm") : "No date available"}
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
                  <Link href={`/health-wellness/health/${event.id}`} passHref>
                    <Button variant="outline">View / Edit</Button>
                  </Link>
                  <Button variant="destructive" onClick={() => handleDeleteHealthEvent(event.id)}>
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

