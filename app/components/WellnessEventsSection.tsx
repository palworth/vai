"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface WellnessEvent {
  id: string
  dogId: string
  userId: string
  eventDate: string
  type: "wellness"
  mentalState: string
  severity: number
  notes: string
}

interface WellnessEventsSectionProps {
  dogId: string
  showToast: (title: string, description: string, isError: boolean) => void
}

export function WellnessEventsSection({ dogId, showToast }: WellnessEventsSectionProps) {
  const router = useRouter()
  const [wellnessEvents, setWellnessEvents] = useState<WellnessEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWellnessEvents = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/wellness-events?dogId=${dogId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch wellness events")
      }
      const data = await response.json()
      console.log("Fetched wellness events:", data)
      setWellnessEvents(data)
    } catch (error) {
      console.error("Error fetching wellness events:", error)
      setError("Failed to fetch wellness events. Please try again later.")
      showToast("Error", "Failed to fetch wellness events", true)
    } finally {
      setIsLoading(false)
    }
  }, [dogId, showToast]) // Removed isLoading from the dependency array

  useEffect(() => {
    fetchWellnessEvents()
  }, [fetchWellnessEvents])

  const handleDeleteWellnessEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/wellness-events?id=${eventId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete event")
      }
      fetchWellnessEvents()
      showToast("Wellness Event Deleted", "The wellness event has been successfully deleted.", false)
    } catch (error) {
      console.error("Error deleting wellness event:", error)
      showToast("Error", "There was a problem deleting the wellness event.", true)
    }
  }

  if (error) {
    return <div>Error: {error}</div>
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

        {isLoading ? (
          <div>Loading wellness events...</div>
        ) : (
          <div className="mt-6 space-y-4">
            {wellnessEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.mentalState.charAt(0).toUpperCase() + event.mentalState.slice(1)}</CardTitle>
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
        )}
      </CardContent>
    </Card>
  )
}

