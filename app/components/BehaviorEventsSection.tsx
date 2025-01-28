"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface BehaviorEvent {
  id: string
  dogId: string
  userId: string
  createdAt: string
  updatedAt: string
  type: "behavior"
  behaviorType: string // Changed from eventType to behaviorType
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBehaviorEvents = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/behavior-events?dogId=${dogId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch behavior events")
      }
      const data = await response.json()
      console.log("Fetched behavior events:", data)
      setBehaviorEvents(data)
    } catch (error) {
      console.error("Error fetching behavior events:", error)
      setError("Failed to fetch behavior events. Please try again later.")
      showToast("Error", "Failed to fetch behavior events", true)
    } finally {
      setIsLoading(false)
    }
  }, [dogId, showToast])

  useEffect(() => {
    fetchBehaviorEvents()
  }, [fetchBehaviorEvents])

  const handleDeleteBehaviorEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/behavior-events?id=${eventId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete event")
      }
      fetchBehaviorEvents()
      showToast("Behavior Event Deleted", "The behavior event has been successfully deleted.", false)
    } catch (error) {
      console.error("Error deleting behavior event:", error)
      showToast("Error", "There was a problem deleting the behavior event.", true)
    }
  }

  if (error) {
    return <div>Error: {error}</div>
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

        {isLoading ? (
          <div>Loading behavior events...</div>
        ) : (
          <div className="mt-6 space-y-4">
            {behaviorEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.behaviorType}</CardTitle>
                  <CardDescription>
                    {event.createdAt ? format(new Date(event.createdAt), "MMMM d, yyyy HH:mm") : "No date available"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>Severity:</strong> {event.severity}/10
                  </p>
                  <p>
                    <strong>Notes:</strong> {event.notes || "No notes provided"}
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {event.updatedAt ? format(new Date(event.updatedAt), "MMMM d, yyyy HH:mm") : "N/A"}
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
        )}
      </CardContent>
    </Card>
  )
}

