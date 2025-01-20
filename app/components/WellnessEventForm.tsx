"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface WellnessEvent {
  id: string
  userId: string
  dogId: string
  mentalState: "depressed" | "anxious" | "lethargic" | "happy" | "loving" | "nervous"
  severity: number
  eventDate: Date
  type: "wellness"
  createdAt: Date
  updatedAt: Date
}

export type WellnessEventFormData = Omit<WellnessEvent, "id" | "userId" | "dogId" | "type" | "createdAt" | "updatedAt">

interface WellnessEventFormProps {
  event?: WellnessEventFormData
  onSuccess: (wellnessEventData: WellnessEventFormData) => void
  onCancel: () => void
}

const mentalStates = ["depressed", "anxious", "lethargic", "happy", "loving", "nervous"]

export function WellnessEventForm({ event, onSuccess, onCancel }: WellnessEventFormProps) {
  const [wellnessEvent, setWellnessEvent] = useState<WellnessEventFormData>({
    mentalState: event?.mentalState || "happy",
    severity: event?.severity || 5,
    eventDate: event?.eventDate || new Date(),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSuccess(wellnessEvent)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{event ? "Edit Wellness Event" : "Add Wellness Event"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eventDate">Event Date</Label>
            <Input
              id="eventDate"
              type="datetime-local"
              value={wellnessEvent.eventDate.toISOString().slice(0, 16)}
              onChange={(e) => setWellnessEvent({ ...wellnessEvent, eventDate: new Date(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mentalState">Mental State</Label>
            <Select
              value={wellnessEvent.mentalState}
              onValueChange={(value: WellnessEvent["mentalState"]) =>
                setWellnessEvent({ ...wellnessEvent, mentalState: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mental state" />
              </SelectTrigger>
              <SelectContent>
                {mentalStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state.charAt(0).toUpperCase() + state.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="severity">Severity (1-10)</Label>
            <Input
              id="severity"
              type="number"
              min="1"
              max="10"
              value={wellnessEvent.severity}
              onChange={(e) => setWellnessEvent({ ...wellnessEvent, severity: Number.parseInt(e.target.value, 10) })}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{event ? "Update" : "Add"} Wellness Event</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

