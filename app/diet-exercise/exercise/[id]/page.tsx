"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"

interface ExerciseEvent {
  id: string
  dogId: string
  activityType: string
  duration: number
  distance: number
  source: string
  eventDate: string
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

export default function ExerciseEventPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<ExerciseEvent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: "", description: "", isError: false })
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/exercise-events/${params.id}`)
        if (!response.ok) throw new Error("Failed to fetch event")
        const data = await response.json()
        setEvent(data)
      } catch (error) {
        console.error("Error fetching event:", error)
        showToast("Error", "Failed to fetch event details", true)
      }
    }

    if (user) fetchEvent()
  }, [user, params.id])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    try {
      const response = await fetch(`/api/exercise-events/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      })

      if (!response.ok) throw new Error("Failed to update event")
      showToast("Success", "Event updated successfully", false)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating event:", error)
      showToast("Error", "Failed to update event", true)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const response = await fetch(`/api/exercise-events/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete event")
      showToast("Success", "Event deleted successfully", false)
      setTimeout(() => router.push("/diet-exercise"), 2000)
    } catch (error) {
      console.error("Error deleting event:", error)
      showToast("Error", "Failed to delete event", true)
    }
  }

  const showToast = (title: string, description: string, isError: boolean) => {
    setToastMessage({ title, description, isError })
    setToastOpen(true)
  }

  if (!event) return <div>Loading...</div>

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
              <div className="space-y-2">
                <Label htmlFor="activityType">Activity Type</Label>
                <Select
                  value={event.activityType}
                  onValueChange={(value: ActivityType) => setEvent({ ...event, activityType: value })}
                  disabled={!isEditing}
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={event.duration}
                  onChange={(e) => setEvent({ ...event, duration: Number(e.target.value) })}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distance">Distance (miles)</Label>
                <Input
                  id="distance"
                  type="number"
                  step="0.1"
                  value={event.distance}
                  onChange={(e) => setEvent({ ...event, distance: Number(e.target.value) })}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select
                  value={event.source}
                  onValueChange={(value: Source) => setEvent({ ...event, source: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  type="datetime-local"
                  value={event.eventDate}
                  onChange={(e) => setEvent({ ...event, eventDate: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>
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
          className={`${toastMessage.isError ? "bg-red-100 border-red-400" : "bg-green-100 border-green-400"} border-l-4 p-4`}
        >
          <ToastTitle className={`${toastMessage.isError ? "text-red-800" : "text-green-800"} font-bold`}>
            {toastMessage.title}
          </ToastTitle>
          <ToastDescription className={`${toastMessage.isError ? "text-red-700" : "text-green-700"}`}>
            {toastMessage.description}
          </ToastDescription>
        </div>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  )
}

