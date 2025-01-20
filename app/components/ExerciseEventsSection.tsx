"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ExerciseEvent {
  id: string
  dogId: string
  userId: string
  eventDate: string
  type: "exercise"
  activityType: string
  duration: number
  distance: number
  source: string
}

interface ExerciseEventsSectionProps {
  dogId: string
  showToast: (title: string, description: string, isError: boolean) => void
}

export function ExerciseEventsSection({ dogId, showToast }: ExerciseEventsSectionProps) {
  const router = useRouter()
  const [exerciseEvents, setExerciseEvents] = useState<ExerciseEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchExerciseEvents = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/exercise-events?dogId=${dogId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch exercise events")
      }
      const data = await response.json()
      console.log("Fetched exercise events:", data)
      setExerciseEvents(data)
    } catch (error) {
      console.error("Error fetching exercise events:", error)
      setError("Failed to fetch exercise events. Please try again later.")
      showToast("Error", "Failed to fetch exercise events", true)
    } finally {
      setIsLoading(false)
    }
  }, [dogId, showToast])

  useEffect(() => {
    fetchExerciseEvents()
  }, [fetchExerciseEvents])

  const handleDeleteExerciseEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/exercise-events?id=${eventId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete event")
      }
      fetchExerciseEvents()
      showToast("Exercise Event Deleted", "The exercise event has been successfully deleted.", false)
    } catch (error) {
      console.error("Error deleting exercise event:", error)
      showToast("Error", "There was a problem deleting the exercise event.", true)
    }
  }

  if (error) {
    return <div>Error: {error}</div>
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

        {isLoading ? (
          <div>Loading exercise events...</div>
        ) : (
          <div className="mt-6 space-y-4">
            {exerciseEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.activityType}</CardTitle>
                  <CardDescription>
                    {event.eventDate ? format(new Date(event.eventDate), "MMMM d, yyyy HH:mm") : "No date available"}
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
        )}
      </CardContent>
    </Card>
  )
}

