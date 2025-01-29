"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { format, parseISO } from "date-fns"

interface ExerciseEvent {
  id: string
  dogId: string
  userId?: string
  activityType: string
  duration: number
  distance: number
  source: string
  eventDate?: string // We'll add eventDate if we want to edit it
  createdAt?: string
  updatedAt?: string
}

const ACTIVITY_TYPES = [
  "Walking",
  "Running/Jogging",
  "Fetch",
  "Hiking",
  "Dog Park Playtime",
  "Indoor Play",
  "Outside Alone Time",
  "Swimming",
] as const
type ActivityType = (typeof ACTIVITY_TYPES)[number]

const SOURCES = ["Manual Add", "Strava", "Whoop", "Fitbit", "Garmin", "Apple Health"] as const
type Source = (typeof SOURCES)[number]

export function ExerciseEventDetails({ id }: { id: string }) {
  const router = useRouter()
  const [event, setEvent] = useState<ExerciseEvent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: "", description: "", isError: false })

  useEffect(() => {
    async function fetchEvent() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/exercise-events/${id}`)
        if (!response.ok) throw new Error("Failed to fetch event")
        const data = await response.json()

        // If we want to let user edit the event date, parse it if present
        setEvent({
          ...data,
          eventDate: data.eventDate ?? "",
        })
      } catch (err) {
        console.error("Error fetching exercise event:", err)
        setError("Failed to load exercise event. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  function showToast(title: string, description: string, isError = false) {
    setToastMessage({ title, description, isError })
    setToastOpen(true)
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!event) return

    try {
      const body = {
        activityType: event.activityType,
        duration: event.duration,
        distance: event.distance,
        source: event.source,
        eventDate: event.eventDate, // an ISO string
      }

      const response = await fetch(`/api/exercise-events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error("Failed to update event")
      showToast("Success", "Event updated successfully")
      setIsEditing(false)

      setTimeout(() => {
        router.push(`/dogs/${event.dogId}`)
      }, 1500)
    } catch (err) {
      console.error("Error updating event:", err)
      showToast("Error", "Failed to update event", true)
    }
  }

  async function handleDelete() {
    if (!event) return

    try {
      const response = await fetch(`/api/exercise-events/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete event")

      showToast("Success", "Event deleted successfully")
      router.push(`/dogs/${event.dogId}`)
    } catch (err) {
      console.error("Error deleting event:", err)
      showToast("Error", "Failed to delete event", true)
    }
  }

  function formatDisplayDate(dateStr?: string) {
    if (!dateStr) return "No date available"
    const date = parseISO(dateStr)
    if (isNaN(date.getTime())) return "No date available"
    return format(date, "MMMM d, yyyy HH:mm")
  }

  function formatDateForInput(dateStr?: string) {
    if (!dateStr) return ""
    const date = parseISO(dateStr)
    if (isNaN(date.getTime())) return ""
    return format(date, "yyyy-MM-dd'T'HH:mm")
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!event) return <div>No event found</div>

  return (
    <ToastProvider>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Exercise Event" : "Exercise Event Details"}</CardTitle>
            <CardDescription>
              {isEditing ? "Update the exercise event details below" : "View exercise event details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Activity Type */}
              <div className="space-y-2">
                <Label htmlFor="activityType">Activity Type</Label>
                {isEditing ? (
                  <Select
                    value={event.activityType}
                    onValueChange={(value: ActivityType) =>
                      setEvent({ ...event, activityType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p>{event.activityType}</p>
                )}
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                {isEditing ? (
                  <Input
                    id="duration"
                    type="number"
                    value={event.duration}
                    onChange={(e) => setEvent({ ...event, duration: Number(e.target.value) })}
                  />
                ) : (
                  <p>{event.duration} minutes</p>
                )}
              </div>

              {/* Distance */}
              <div className="space-y-2">
                <Label htmlFor="distance">Distance (miles)</Label>
                {isEditing ? (
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    value={event.distance}
                    onChange={(e) => setEvent({ ...event, distance: Number(e.target.value) })}
                  />
                ) : (
                  <p>{event.distance} miles</p>
                )}
              </div>

              {/* Source */}
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                {isEditing ? (
                  <Select
                    value={event.source}
                    onValueChange={(value: Source) => setEvent({ ...event, source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p>{event.source}</p>
                )}
              </div>

              {/* Event Date */}
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date</Label>
                {isEditing ? (
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    value={formatDateForInput(event.eventDate)}
                    onChange={(e) => setEvent({ ...event, eventDate: e.target.value })}
                  />
                ) : (
                  <p>{formatDisplayDate(event.eventDate)}</p>
                )}
              </div>

              {/* Buttons */}
              {isEditing ? (
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              ) : (
                <div className="flex justify-end space-x-2">
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                  <Button type="button" variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      <Toast open={toastOpen} onOpenChange={setToastOpen}>
        <div
          className={`${
            toastMessage.isError ? "bg-red-100 border-red-400" : "bg-green-100 border-green-400"
          } border-l-4 p-4`}
        >
          <ToastTitle
            className={`${toastMessage.isError ? "text-red-800" : "text-green-800"} font-bold`}
          >
            {toastMessage.title}
          </ToastTitle>
          <ToastDescription
            className={`${toastMessage.isError ? "text-red-700" : "text-green-700"}`}
          >
            {toastMessage.description}
          </ToastDescription>
        </div>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  )
}
