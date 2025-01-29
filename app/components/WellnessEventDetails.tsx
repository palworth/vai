"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { format, parseISO } from "date-fns"

interface WellnessEvent {
  id: string
  dogId: string
  userId?: string
  mentalState: "depressed" | "anxious" | "lethargic" | "happy" | "loving" | "nervous"
  severity: number
  notes?: string
  eventDate?: string
  createdAt?: string
  updatedAt?: string
}

const MENTAL_STATES = ["depressed", "anxious", "lethargic", "happy", "loving", "nervous"] as const
type MentalState = (typeof MENTAL_STATES)[number]

export function WellnessEventDetails({ id }: { id: string }) {
  const router = useRouter()
  const [event, setEvent] = useState<WellnessEvent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: "", description: "", isError: false })

  useEffect(() => {
    async function fetchEvent() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/wellness-events/${id}`)
        if (!response.ok) throw new Error("Failed to fetch event")
        const data = await response.json()

        // parse date to a string if needed
        setEvent({
          ...data,
          eventDate: data.eventDate ?? "",
        })
      } catch (err) {
        console.error("Error fetching wellness event:", err)
        setError("Failed to load wellness event. Please try again.")
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
        mentalState: event.mentalState,
        severity: event.severity,
        notes: event.notes || "",
        eventDate: event.eventDate,
      }

      const res = await fetch(`/api/wellness-events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error("Failed to update wellness event")
      showToast("Success", "Event updated successfully")
      setIsEditing(false)

      setTimeout(() => {
        router.push(`/dogs/${event.dogId}`)
      }, 1500)
    } catch (err) {
      console.error("Error updating wellness event:", err)
      showToast("Error", "Failed to update event", true)
    }
  }

  async function handleDelete() {
    if (!event) return

    try {
      const res = await fetch(`/api/wellness-events/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete event")

      showToast("Success", "Event deleted successfully")
      router.push(`/dogs/${event.dogId}`)
    } catch (err) {
      console.error("Error deleting wellness event:", err)
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
            <CardTitle>{isEditing ? "Edit Wellness Event" : "Wellness Event Details"}</CardTitle>
            <CardDescription>
              {isEditing ? "Update the wellness event details below" : "View wellness event details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Mental State */}
              <div className="space-y-2">
                <Label>Mental State</Label>
                {isEditing ? (
                  <Select
                    value={event.mentalState}
                    onValueChange={(val: MentalState) => setEvent({ ...event, mentalState: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mental state" />
                    </SelectTrigger>
                    <SelectContent>
                      {MENTAL_STATES.map((ms) => (
                        <SelectItem key={ms} value={ms}>
                          {ms}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p>{event.mentalState}</p>
                )}
              </div>

              {/* Severity */}
              <div className="space-y-2">
                <Label>Severity (1-10)</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={event.severity}
                    onChange={(e) => setEvent({ ...event, severity: Number(e.target.value) })}
                  />
                ) : (
                  <p>{event.severity}</p>
                )}
              </div>

              {/* Notes (optional) */}
              <div className="space-y-2">
                <Label>Notes</Label>
                {isEditing ? (
                  <Textarea
                    value={event.notes || ""}
                    onChange={(e) => setEvent({ ...event, notes: e.target.value })}
                    placeholder="Any notes about the dog's wellness..."
                  />
                ) : (
                  <p>{event.notes || "No notes provided"}</p>
                )}
              </div>

              {/* Event Date */}
              <div className="space-y-2">
                <Label>Event Date</Label>
                {isEditing ? (
                  <Input
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
          <ToastDescription className={`${toastMessage.isError ? "text-red-700" : "text-green-700"}`}>
            {toastMessage.description}
          </ToastDescription>
        </div>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  )
}
