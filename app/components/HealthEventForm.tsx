"use client"

import { useState, useEffect } from "react"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"

interface HealthEvent {
  id?: string
  dogId: string
  userId: string
  eventType: string
  notes: string
  severity: number
  eventDate: string // "yyyy-MM-ddTHH:mm"
  createdAt?: Date
  updatedAt?: Date
}

interface HealthEventFormProps {
  dogId: string
  userId: string
  event?: HealthEvent
  onSuccess: () => void
  onCancel: () => void
}

export function HealthEventForm({ dogId, userId, event, onSuccess, onCancel }: HealthEventFormProps) {
  const [healthEvent, setHealthEvent] = useState<
    Omit<HealthEvent, "id" | "dogId" | "userId" | "createdAt" | "updatedAt">
  >({
    eventType: event?.eventType || "",
    notes: event?.notes || "",
    severity: event?.severity || 1,
    eventDate: event?.eventDate || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  })

  useEffect(() => {
    // If there's an existing event, populate the form
    if (event) {
      setHealthEvent({
        eventType: event.eventType,
        notes: event.notes,
        severity: event.severity,
        eventDate: event.eventDate, // "yyyy-MM-ddTHH:mm"
      })
    }
  }, [event])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const eventData = { ...healthEvent }

    try {
      if (event?.id) {
        // Editing an existing event
        await updateDoc(doc(db, "healthEvents", event.id), {
          ...eventData,
          updatedAt: serverTimestamp(),
        })
      } else {
        // Creating a new event
        await addDoc(collection(db, "healthEvents"), {
          ...eventData,
          dogId: doc(db, "dogs", dogId),
          userId: doc(db, "users", userId),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // Convert the 'eventDate' string to a Firestore Timestamp
          eventDate: Timestamp.fromDate(new Date(eventData.eventDate)),
        })
      }
      onSuccess()
    } catch (error) {
      console.error("Error saving health event:", error)
      // Optionally show an error message or toast
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
          value={healthEvent.eventDate}
          onChange={(e) => setHealthEvent({ ...healthEvent, eventDate: e.target.value })}
          required
        />
      </div>

      {/* Event Type */}
      <div className="space-y-2">
        <Label htmlFor="eventType">Event Type</Label>
        <Input
          id="eventType"
          value={healthEvent.eventType}
          onChange={(e) => setHealthEvent({ ...healthEvent, eventType: e.target.value })}
          placeholder="e.g., Vaccination, Injury, Checkup"
          required
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={healthEvent.notes}
          onChange={(e) => setHealthEvent({ ...healthEvent, notes: e.target.value })}
          placeholder="Describe the health event..."
        />
      </div>

      {/* Severity */}
      <div className="space-y-2">
        <Label htmlFor="severity">Severity (1-10)</Label>
        <Input
          id="severity"
          type="number"
          min={1}
          max={10}
          value={healthEvent.severity}
          onChange={(e) => setHealthEvent({ ...healthEvent, severity: Number(e.target.value) })}
          required
        />
      </div>

      {/* If editing, show createdAt */}
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
        <Button type="submit">{event?.id ? "Update" : "Add"} Health Event</Button>
      </div>
    </form>
  )
}
