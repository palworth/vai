"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { use } from "react"

interface HealthEvent {
  id: string
  dogId: string
  eventType: string
  notes: string
  severity: number
  eventDate: string
}

export default function HealthEventPage({ params }: { params: Promise<{ id: string }> }) {
  const id = use(params).id
  const [event, setEvent] = useState<HealthEvent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: "", description: "", isError: false })
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/health-events/${id}`)
        if (!response.ok) throw new Error("Failed to fetch event")
        const data = await response.json()
        setEvent(data)
      } catch (error) {
        console.error("Error fetching event:", error)
        showToast("Error", "Failed to fetch event details", true)
      }
    }

    if (user) fetchEvent()
  }, [user, id])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    try {
      const response = await fetch(`/api/health-events/${(await params).id}`, {
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
      const response = await fetch(`/api/health-events/${(await params).id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete event")
      showToast("Success", "Event deleted successfully", false)
      setTimeout(() => router.push("/health-wellness"), 2000)
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
            <CardTitle>{isEditing ? "Edit Health Event" : "Health Event Details"}</CardTitle>
            <CardDescription>
              {isEditing ? "Update the health event details below" : "View health event details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Input
                  id="eventType"
                  value={event.eventType}
                  onChange={(e) => setEvent({ ...event, eventType: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={event.notes}
                  onChange={(e) => setEvent({ ...event, notes: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity (1-10)</Label>
                <Input
                  id="severity"
                  type="number"
                  min="1"
                  max="10"
                  value={event.severity}
                  onChange={(e) => setEvent({ ...event, severity: Number(e.target.value) })}
                  disabled={!isEditing}
                  required
                />
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

