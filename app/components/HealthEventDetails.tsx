"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { format, parseISO } from "date-fns"

interface TimestampData {
  seconds: number
  nanoseconds: number
}

interface HealthEvent {
  id: string
  dogId: string
  eventType: string
  notes: string
  severity: number
  eventDate: string // We'll store it as an ISO string in state
  createdAt?: string | TimestampData
  updatedAt?: string | TimestampData
}

export function HealthEventDetails({ id }: { id: string }) {
  const router = useRouter()
  const [event, setEvent] = useState<HealthEvent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: "", description: "", isError: false })

  useEffect(() => {
    async function fetchEvent() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/health-events/${id}`)
        if (!res.ok) {
          throw new Error(`Failed to fetch health event: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        // Convert eventDate to a string if available, else empty
        setEvent({
          ...data,
          eventDate: data.eventDate ?? "",
        })
      } catch (err) {
        console.error("Error fetching health event:", err)
        setError("Failed to load health event. Please try again.")
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
        eventType: event.eventType,
        notes: event.notes,
        severity: event.severity,
        eventDate: event.eventDate, // an ISO date string like "2025-01-01T12:00"
      }

      const res = await fetch(`/api/health-events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        throw new Error("Failed to update health event")
      }

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
      const res = await fetch(`/api/health-events/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error("Failed to delete event")
      }

      showToast("Success", "Event deleted successfully")
      router.push(`/dogs/${event.dogId}`)
    } catch (err) {
      console.error("Error deleting event:", err)
      showToast("Error", "Failed to delete event", true)
    }
  }

  function formatDateForDisplay(dateStr: string) {
    if (!dateStr) return "No date available"
    const date = parseISO(dateStr)
    if (isNaN(date.getTime())) return "No date available"
    return format(date, "MMMM d, yyyy HH:mm")
  }

  function formatDateForInput(dateStr: string) {
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
            <CardTitle>{isEditing ? "Edit Health Event" : "Health Event Details"}</CardTitle>
            <CardDescription>
              {isEditing ? "Update the health event details below" : "View health event details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Event Type */}
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                {isEditing ? (
                  <Input
                    id="eventType"
                    value={event.eventType}
                    onChange={(e) => setEvent({ ...event, eventType: e.target.value })}
                    required
                  />
                ) : (
                  <p>{event.eventType}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                {isEditing ? (
                  <Textarea
                    id="notes"
                    value={event.notes}
                    onChange={(e) => setEvent({ ...event, notes: e.target.value })}
                    required
                  />
                ) : (
                  <p>{event.notes}</p>
                )}
              </div>

              {/* Severity */}
              <div className="space-y-2">
                <Label htmlFor="severity">Severity (1-10)</Label>
                {isEditing ? (
                  <Input
                    id="severity"
                    type="number"
                    min={1}
                    max={10}
                    value={event.severity}
                    onChange={(e) => setEvent({ ...event, severity: Number(e.target.value) })}
                    required
                  />
                ) : (
                  <p>{event.severity}</p>
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
                  <p>{formatDateForDisplay(event.eventDate)}</p>
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
