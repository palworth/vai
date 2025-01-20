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
import { use } from "react"

interface DietEvent {
  id: string
  dogId: string
  foodType: string
  brandName: string
  quantity: number
  eventDate: string
}

const FOOD_TYPES = ["dry kibble", "homemade", "raw", "custom", "wet"] as const
type FoodType = (typeof FOOD_TYPES)[number]

export default function DietEventPage({ params }: { params: Promise<{ id: string }> }) {
  const id = use(params).id
  const [event, setEvent] = useState<DietEvent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: "", description: "", isError: false })
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/diet-events/${id}`)
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
      const response = await fetch(`/api/diet-events/${id}`, {
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
      const response = await fetch(`/api/diet-events/${id}`, {
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
            <CardTitle>{isEditing ? "Edit Diet Event" : "Diet Event Details"}</CardTitle>
            <CardDescription>
              {isEditing ? "Update the diet event details below" : "View diet event details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="foodType">Food Type</Label>
                <Select
                  value={event.foodType}
                  onValueChange={(value: FoodType) => setEvent({ ...event, foodType: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select food type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  value={event.brandName}
                  onChange={(e) => setEvent({ ...event, brandName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (in grams)</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={event.quantity}
                  onChange={(e) => setEvent({ ...event, quantity: Number(e.target.value) })}
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

