"use client"

import { useState, useEffect } from "react"
import { addDoc, collection, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

interface DietEvent {
  id?: string
  dogId: string
  userId: string
  eventDate: string // We'll store this as a string with date/time
  foodType: string
  brandName?: string
  quantity: number
  createdAt?: Date
  updatedAt?: Date
}

interface DietEventFormProps {
  dogId: string
  userId: string
  /** If event is passed, we assume we are editing */
  event?: DietEvent
  onSuccess: () => void
  onCancel: () => void
}

const FOOD_TYPES = ["dry kibble", "homemade", "raw", "custom", "wet"]

export function DietEventForm({ dogId, userId, event, onSuccess, onCancel }: DietEventFormProps) {
  const [dietEvent, setDietEvent] = useState<
    Omit<DietEvent, "id" | "dogId" | "userId" | "createdAt" | "updatedAt">
  >({
    eventDate: event?.eventDate || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    foodType: event?.foodType || "dry kibble",
    brandName: event?.brandName || "",
    quantity: event?.quantity || 0,
  })

  useEffect(() => {
    if (event) {
      setDietEvent({
        eventDate: event.eventDate,
        foodType: event.foodType,
        brandName: event.brandName || "",
        quantity: event.quantity,
      })
    }
  }, [event])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      if (event?.id) {
        // If there's an ID, update the existing doc
        await updateDoc(doc(db, "dietEvents", event.id), {
          ...dietEvent,
          updatedAt: serverTimestamp(),
        })
      } else {
        // Otherwise, create a new doc
        await addDoc(collection(db, "dietEvents"), {
          ...dietEvent,
          dogId: doc(db, "dogs", dogId),
          userId: doc(db, "users", userId),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
      onSuccess()
    } catch (error) {
      console.error("Error saving diet event:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Event Date */}
      <div className="space-y-2">
        <Label htmlFor="eventDate">Event Date</Label>
        <Input
          id="eventDate"
          type="datetime-local"
          value={dietEvent.eventDate}
          onChange={(e) => setDietEvent({ ...dietEvent, eventDate: e.target.value })}
          required
        />
      </div>

      {/* Food Type */}
      <div className="space-y-2">
        <Label htmlFor="foodType">Food Type</Label>
        <Select
          value={dietEvent.foodType}
          onValueChange={(value) => {
            setDietEvent({ ...dietEvent, foodType: value })
          }}
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

      {/* Brand Name */}
      <div className="space-y-2">
        <Label htmlFor="brandName">Brand Name (Optional)</Label>
        <Input
          id="brandName"
          value={dietEvent.brandName || ""}
          onChange={(e) => setDietEvent({ ...dietEvent, brandName: e.target.value })}
        />
      </div>

      {/* Quantity */}
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity (in grams)</Label>
        <Input
          id="quantity"
          type="number"
          value={dietEvent.quantity}
          onChange={(e) =>
            setDietEvent({ ...dietEvent, quantity: Number.parseFloat(e.target.value) })
          }
          required
        />
      </div>

      {/* If editing, show creation date, etc. */}
      {event?.createdAt && (
        <div className="space-y-2">
          <Label>Created At</Label>
          <p>{format(event.createdAt, "MMMM d, yyyy HH:mm:ss")}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{event?.id ? "Update" : "Add"} Diet Event</Button>
      </div>
    </form>
  )
}
