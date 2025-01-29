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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"

const MENTAL_STATES = ["depressed", "anxious", "lethargic", "happy", "loving", "nervous"] as const
type MentalState = (typeof MENTAL_STATES)[number]

interface WellnessEvent {
  id?: string
  dogId: string
  userId: string
  mentalState: MentalState
  severity: number
  notes?: string
  eventDate: string // "yyyy-MM-ddTHH:mm" local string
  createdAt?: Date
  updatedAt?: Date
}

interface WellnessEventFormProps {
  dogId: string
  userId: string
  event?: WellnessEvent
  onSuccess: () => void
  onCancel: () => void
}

export function WellnessEventForm({ dogId, userId, event, onSuccess, onCancel }: WellnessEventFormProps) {
  const [wellnessEvent, setWellnessEvent] = useState<
    Omit<WellnessEvent, "id" | "dogId" | "userId" | "createdAt" | "updatedAt">
  >({
    mentalState: event?.mentalState || "happy",
    severity: event?.severity || 5,
    notes: event?.notes || "",
    eventDate: event?.eventDate || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  })

  useEffect(() => {
    if (event) {
      setWellnessEvent({
        mentalState: event.mentalState,
        severity: event.severity,
        notes: event.notes || "",
        eventDate: event.eventDate,
      })
    }
  }, [event])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (event?.id) {
        // Update
        await updateDoc(doc(db, "wellnessEvents", event.id), {
          ...wellnessEvent,
          updatedAt: serverTimestamp(),
          eventDate: Timestamp.fromDate(new Date(wellnessEvent.eventDate)),
        })
      } else {
        // Create new
        await addDoc(collection(db, "wellnessEvents"), {
          ...wellnessEvent,
          dogId: doc(db, "dogs", dogId),
          userId: doc(db, "users", userId),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          eventDate: Timestamp.fromDate(new Date(wellnessEvent.eventDate)),
        })
      }
      onSuccess()
    } catch (err) {
      console.error("Error saving wellness event:", err)
      // Optionally show error
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
          value={wellnessEvent.eventDate}
          onChange={(e) => setWellnessEvent({ ...wellnessEvent, eventDate: e.target.value })}
          required
        />
      </div>

      {/* Mental State */}
      <div className="space-y-2">
        <Label htmlFor="mentalState">Mental State</Label>
        <Select
          value={wellnessEvent.mentalState}
          onValueChange={(value: MentalState) => setWellnessEvent({ ...wellnessEvent, mentalState: value })}
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
      </div>

      {/* Severity */}
      <div className="space-y-2">
        <Label htmlFor="severity">Severity (1-10)</Label>
        <Input
          id="severity"
          type="number"
          min={1}
          max={10}
          value={wellnessEvent.severity}
          onChange={(e) => setWellnessEvent({ ...wellnessEvent, severity: Number(e.target.value) })}
          required
        />
      </div>

      {/* Notes (optional) */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={wellnessEvent.notes}
          onChange={(e) => setWellnessEvent({ ...wellnessEvent, notes: e.target.value })}
          placeholder="Any notes about the dog's wellness..."
        />
      </div>

      {/* If editing, show Created At */}
      {event?.createdAt && (
        <div className="space-y-2">
          <Label>Created At</Label>
          <p>{event.createdAt.toString()}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{event?.id ? "Update" : "Add"} Wellness Event</Button>
      </div>
    </form>
  )
}
