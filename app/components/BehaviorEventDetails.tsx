"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
// Removed: We don't actually use `user` from the auth context
// import { useAuth } from "@/app/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { format, parseISO } from "date-fns"

interface Timestamp {
  seconds: number
  nanoseconds: number
}

interface BehaviorEvent {
  id: string
  dogId: string
  behaviorType: string
  notes: string
  severity: number
  eventDate: string
  createdAt: string | Timestamp
}

export function BehaviorEventDetails({ id }: { id: string }) {
  const router = useRouter()
  // const { user } = useAuth()  // Removed since it's not used
  const [event, setEvent] = useState<BehaviorEvent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string; isError: boolean }>({
    title: "",
    description: "",
    isError: false,
  })

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/behavior-events/${id}`)
        if (!res.ok) {
          throw new Error(`Failed to fetch behavior event: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        setEvent(data)
        console.log("dogId:", data.dogId) // Log the dogId
      } catch (err) {
        console.error("Error fetching behavior event:", err)
        setError("Failed to load behavior event. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    try {
      const updateData = {
        behaviorType: event.behaviorType,
        severity: event.severity,
        notes: event.notes,
        eventDate: event.eventDate,
      }

      const res = await fetch(`/api/behavior-events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })
      if (!res.ok) {
        throw new Error("Failed to update behavior event")
      }
      setToastMessage({ title: "Success!", description: "Behavior event updated successfully", isError: false })
      setToastOpen(true)
      setIsEditing(false)

      // Add a slight delay before redirecting
      setTimeout(() => {
        router.push(`/dogs/${event.dogId}`)
      }, 1500) // 1.5 seconds delay
    } catch (err) {
      console.error("Error updating behavior event:", err)
      setToastMessage({ title: "Error!", description: "Failed to update behavior event", isError: true })
      setToastOpen(true)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/behavior-events/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error("Failed to delete behavior event")
      }
      setToastMessage({ title: "Success!", description: "Behavior event deleted successfully", isError: false })
      setToastOpen(true)
      router.push("/dogs") // Redirect to the dogs page after successful deletion
    } catch (err) {
      console.error("Error deleting behavior event:", err)
      setToastMessage({ title: "Error!", description: "Failed to delete behavior event", isError: true })
      setToastOpen(true)
    }
  }

  // Helper function to format the event date
  function formatEventDate(date: string) {
    if (!date) {
      return "No date available"
    }
    return format(parseISO(date), "MMMM d, yyyy HH:mm")
  }

  // Helper function to format the date for the datetime-local input
  function formatDateForInput(date: string) {
    if (!date) {
      return ""
    }
    return format(parseISO(date), "yyyy-MM-dd'T'HH:mm")
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!event) return <div>No event found</div>

  return (
    <ToastProvider>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Behavior Event" : "Behavior Event Details"}</CardTitle>
            <CardDescription>
              {isEditing ? "Update the behavior event details below" : "View behavior event details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="behaviorType">Behavior Type</Label>
                {isEditing ? (
                  <Input
                    id="behaviorType"
                    type="text"
                    value={event.behaviorType}
                    onChange={(e) => setEvent({ ...event, behaviorType: e.target.value })}
                  />
                ) : (
                  <p>{event.behaviorType}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                {isEditing ? (
                  <Input
                    id="severity"
                    type="number"
                    value={event.severity}
                    onChange={(e) => setEvent({ ...event, severity: Number.parseInt(e.target.value, 10) })}
                  />
                ) : (
                  <p>{event.severity}</p>
                )}
              </div>
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
                  <p>{formatEventDate(event.eventDate)}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                {isEditing ? (
                  <Textarea
                    id="notes"
                    value={event.notes || ""}
                    onChange={(e) => setEvent({ ...event, notes: e.target.value })}
                    placeholder="Optional: Add any additional notes"
                  />
                ) : (
                  <p>{event.notes || "No notes provided"}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="createdAt">Created At</Label>
                <p>{formatEventDate(event.createdAt as string)}</p>
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
          className={`${
            toastMessage.isError ? "bg-red-100 border-red-400" : "bg-green-100 border-green-400"
          } border-l-4 p-4`}
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
