"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
//import { Textarea } from "@/components/ui/textarea" // If you want to handle notes, optional
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { format, parseISO } from "date-fns"

interface Timestamp {
  seconds: number
  nanoseconds: number
}

interface DietEvent {
  id: string
  dogId: string
  userId: string
  foodType: string
  brandName: string
  quantity: number
  eventDate: string // stored as ISO string in local state
  createdAt?: string | Timestamp
  updatedAt?: string | Timestamp
}

export function DietEventDetails({ id }: { id: string }) {
  const router = useRouter()
  const [event, setEvent] = useState<DietEvent | null>(null)
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
    async function fetchDietEvent() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/diet-events/${id}`)
        if (!res.ok) {
          throw new Error(`Failed to fetch diet event: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        // data.eventDate is an ISO string (or null). We'll store it as a string in state
        setEvent({
          ...data,
          eventDate: data.eventDate ?? "", // fallback if null
        })
      } catch (err) {
        console.error("Error fetching diet event:", err)
        setError("Failed to load diet event. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDietEvent()
  }, [id])

  const showToast = (title: string, description: string, isError = false) => {
    setToastMessage({ title, description, isError })
    setToastOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    try {
      // Only send the fields we're updating
      const body = {
        foodType: event.foodType,
        brandName: event.brandName,
        quantity: event.quantity,
        eventDate: event.eventDate, // "YYYY-MM-DDTHH:mm" local string
      }

      const res = await fetch(`/api/diet-events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        throw new Error("Failed to update diet event")
      }

      showToast("Success!", "Diet event updated successfully")
      setIsEditing(false)

      // Add a short delay before redirecting back to the dog's page
      setTimeout(() => {
        router.push(`/dogs/${event.dogId}`)
      }, 1500)
    } catch (err) {
      console.error("Error updating diet event:", err)
      showToast("Error!", "Failed to update diet event", true)
    }
  }

  const handleDelete = async () => {
    if (!event) return

    try {
      const res = await fetch(`/api/diet-events/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error("Failed to delete diet event")
      }

      showToast("Success!", "Diet event deleted successfully")

      // Redirect after successful deletion
      router.push(`/dogs/${event.dogId}`)
    } catch (err) {
      console.error("Error deleting diet event:", err)
      showToast("Error!", "Failed to delete diet event", true)
    }
  }

  /** Format the eventDate for display */
  function formatEventDate(dateStr: string) {
    if (!dateStr) return "No date available"
    const date = parseISO(dateStr) // convert from ISO string to Date
    if (isNaN(date.getTime())) return "No date available"
    return format(date, "MMMM d, yyyy HH:mm")
  }

  /** Format for <input type="datetime-local"> */
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
            <CardTitle>{isEditing ? "Edit Diet Event" : "Diet Event Details"}</CardTitle>
            <CardDescription>
              {isEditing ? "Update the diet event details below" : "View diet event details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Food Type */}
              <div className="space-y-2">
                <Label htmlFor="foodType">Food Type</Label>
                {isEditing ? (
                  <Input
                    id="foodType"
                    type="text"
                    value={event.foodType}
                    onChange={(e) => setEvent({ ...event, foodType: e.target.value })}
                  />
                ) : (
                  <p>{event.foodType}</p>
                )}
              </div>

              {/* Brand Name */}
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                {isEditing ? (
                  <Input
                    id="brandName"
                    type="text"
                    value={event.brandName}
                    onChange={(e) => setEvent({ ...event, brandName: e.target.value })}
                  />
                ) : (
                  <p>{event.brandName || "No brand name provided"}</p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (in grams)</Label>
                {isEditing ? (
                  <Input
                    id="quantity"
                    type="number"
                    value={event.quantity}
                    onChange={(e) => setEvent({ ...event, quantity: Number(e.target.value) })}
                  />
                ) : (
                  <p>{event.quantity}</p>
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
                  <p>{formatEventDate(event.eventDate)}</p>
                )}
              </div>

              {/* Created At (read-only) */}
              {event.createdAt && (
                <div className="space-y-2">
                  <Label htmlFor="createdAt">Created At</Label>
                  <p>{formatEventDate(String(event.createdAt))}</p>
                </div>
              )}

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

      {/* Toast */}
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
