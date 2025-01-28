"use client"

import { useState, useEffect, useMemo } from "react"
import { addDoc, collection, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

interface BehaviorEvent {
  id?: string
  dogId: string
  userId: string
  behaviorType: string
  severity: number
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

interface BehaviorEventFormProps {
  dogId: string
  userId: string
  event?: BehaviorEvent
  onSuccess: () => void
  onCancel: () => void
}

export function BehaviorEventForm({ dogId, userId, event, onSuccess, onCancel }: BehaviorEventFormProps) {
  const [behaviorEvent, setBehaviorEvent] = useState<
    Omit<BehaviorEvent, "id" | "dogId" | "userId" | "createdAt" | "updatedAt">
  >({
    behaviorType: event?.behaviorType || "",
    severity: event?.severity || 1,
    notes: event?.notes || "",
  })
  const [isCustomBehavior, setIsCustomBehavior] = useState(false)
  const [customBehaviorType, setCustomBehaviorType] = useState("")

  const behaviorTypes = useMemo(
    () => ["Excessive Barking", "Chewing", "Anxiety Attack", "Aggression", "Disobedience"],
    [],
  )

  useEffect(() => {
    if (event) {
      const isCustom = !behaviorTypes.includes(event.behaviorType)
      setBehaviorEvent({
        behaviorType: isCustom ? "custom" : event.behaviorType,
        severity: event.severity,
        notes: event.notes || "",
      })
      setIsCustomBehavior(isCustom)
      setCustomBehaviorType(isCustom ? event.behaviorType : "")
    }
  }, [event, behaviorTypes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalBehaviorType = isCustomBehavior ? customBehaviorType : behaviorEvent.behaviorType

    if (!finalBehaviorType) {
      alert("Please select or add a behavior type")
      return
    }

    try {
      const eventData = {
        ...behaviorEvent,
        behaviorType: finalBehaviorType,
      }

      if (event?.id) {
        await updateDoc(doc(db, "behaviorEvents", event.id), {
          ...eventData,
          updatedAt: serverTimestamp(),
        })
      } else {
        await addDoc(collection(db, "behaviorEvents"), {
          ...eventData,
          dogId: doc(db, "dogs", dogId),
          userId: doc(db, "users", userId),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
      onSuccess()
    } catch (error) {
      console.error("Error saving behavior event:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="behaviorType">Behavior Type</Label>
        <Select
          value={behaviorEvent.behaviorType}
          onValueChange={(value) => {
            setBehaviorEvent({ ...behaviorEvent, behaviorType: value })
            setIsCustomBehavior(value === "custom")
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select behavior type" />
          </SelectTrigger>
          <SelectContent>
            {behaviorTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isCustomBehavior && (
        <div className="space-y-2">
          <Label htmlFor="customBehaviorType">Custom Behavior Type</Label>
          <Input
            id="customBehaviorType"
            value={customBehaviorType}
            onChange={(e) => setCustomBehaviorType(e.target.value)}
            placeholder="Enter custom behavior type"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="severity">Severity (1-10)</Label>
        <Input
          id="severity"
          type="number"
          min={1}
          max={10}
          value={behaviorEvent.severity}
          onChange={(e) => setBehaviorEvent({ ...behaviorEvent, severity: Number.parseInt(e.target.value, 10) })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={behaviorEvent.notes}
          onChange={(e) => setBehaviorEvent({ ...behaviorEvent, notes: e.target.value })}
          placeholder="Optional: Add any additional notes"
          rows={4}
        />
      </div>

      {event && (
        <div className="space-y-2">
          <Label>Created At</Label>
          <p>{event.createdAt ? format(event.createdAt, "MMMM d, yyyy HH:mm:ss") : "N/A"}</p>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{event?.id ? "Update" : "Add"} Behavior Event</Button>
      </div>
    </form>
  )
}

