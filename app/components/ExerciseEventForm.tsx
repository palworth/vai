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
import { format } from "date-fns"

/** We define the shape of an ExerciseEvent locally. Fields not included in doc creation. */
interface ExerciseEvent {
  id?: string
  dogId: string
  dateTime: Date
  activityType: string
  duration?: number // optional
  distance?: number // optional
  source?: string
  createdAt?: Date
  updatedAt?: Date
}

interface ExerciseEventFormProps {
  dogId: string
  event?: ExerciseEvent
  onSuccess: () => void
  onCancel: () => void
}

/** For demonstration, let's define some typical activity types/sources */
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

const SOURCES = ["Manual Add", "Strava", "Whoop", "Fitbit", "Garmin", "Apple Health"] as const

export function ExerciseEventForm({ dogId, event, onSuccess, onCancel }: ExerciseEventFormProps) {
  const [exerciseEvent, setExerciseEvent] = useState<Omit<ExerciseEvent, "id" | "dogId" | "createdAt" | "updatedAt">>({
    dateTime: event?.dateTime || new Date(),
    activityType: event?.activityType || "Walking",
    duration: event?.duration || undefined,
    distance: event?.distance || undefined,
    source: event?.source || "Manual Add",
  })

  useEffect(() => {
    if (event) {
      setExerciseEvent({
        dateTime: new Date(event.dateTime),
        activityType: event.activityType,
        duration: event.duration,
        distance: event.distance,
        source: event.source,
      })
    }
  }, [event])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload = {
        ...exerciseEvent,
        // Convert dateTime to a Firestore Timestamp
        dateTime: Timestamp.fromDate(exerciseEvent.dateTime),
        updatedAt: serverTimestamp(),
      }

      if (event?.id) {
        // Update existing
        await updateDoc(doc(db, "exerciseEvents", event.id), payload)
      } else {
        // Create new
        await addDoc(collection(db, "exerciseEvents"), {
          ...payload,
          dogId: doc(db, "dogs", dogId),
          createdAt: serverTimestamp(),
        })
      }

      onSuccess()
    } catch (err) {
      console.error("Error saving exercise event:", err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date/Time */}
      <div className="space-y-2">
        <Label htmlFor="dateTime">Date/Time</Label>
        <Input
          id="dateTime"
          type="datetime-local"
          value={format(exerciseEvent.dateTime, "yyyy-MM-dd'T'HH:mm")}
          onChange={(e) => setExerciseEvent({ ...exerciseEvent, dateTime: new Date(e.target.value) })}
        />
      </div>

      {/* Activity Type */}
      <div className="space-y-2">
        <Label>Activity Type</Label>
        <Select
          value={exerciseEvent.activityType}
          onValueChange={(val) => setExerciseEvent({ ...exerciseEvent, activityType: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose activity type" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVITY_TYPES.map((act) => (
              <SelectItem key={act} value={act}>
                {act}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Duration (optional) */}
      <div className="space-y-2">
        <Label>Duration (minutes) [Optional]</Label>
        <Input
          type="number"
          value={exerciseEvent.duration ?? ""}
          onChange={(e) =>
            setExerciseEvent({ ...exerciseEvent, duration: e.target.value ? Number(e.target.value) : undefined })
          }
        />
      </div>

      {/* Distance (optional) */}
      <div className="space-y-2">
        <Label>Distance (miles) [Optional]</Label>
        <Input
          type="number"
          step="0.01"
          value={exerciseEvent.distance ?? ""}
          onChange={(e) =>
            setExerciseEvent({ ...exerciseEvent, distance: e.target.value ? Number(e.target.value) : undefined })
          }
        />
      </div>

      {/* Source */}
      <div className="space-y-2">
        <Label>Source</Label>
        <Select
          value={exerciseEvent.source ?? "Manual Add"}
          onValueChange={(val) => setExerciseEvent({ ...exerciseEvent, source: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            {SOURCES.map((src) => (
              <SelectItem key={src} value={src}>
                {src}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{event?.id ? "Update" : "Add"} Exercise Event</Button>
      </div>
    </form>
  )
}
