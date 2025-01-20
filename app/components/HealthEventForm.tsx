"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface HealthEvent {
  id: string
  dogId: string
  userId: string
  eventDate: Date
  type: "health"
  eventType: string
  notes: string
  severity: number
}

interface HealthEventFormProps {
  dogId: string
  event?: Omit<HealthEvent, "id" | "dogId" | "userId" | "type">
  onSuccess: () => void
  onCancel: () => void
}

const HealthEventForm: React.FC<HealthEventFormProps> = ({ dogId, event, onSuccess, onCancel }) => {
  const [healthEvent, setHealthEvent] = useState<Omit<HealthEvent, "id" | "dogId" | "userId" | "type">>({
    eventDate: event?.eventDate || new Date(),
    eventType: event?.eventType || "",
    notes: event?.notes || "",
    severity: event?.severity || 1,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here...
    console.log(healthEvent)
    onSuccess()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{event ? "Edit Health Event" : "Add Health Event"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eventDate">Event Date</Label>
            <Input
              id="eventDate"
              type="datetime-local"
              value={format(healthEvent.eventDate, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => setHealthEvent({ ...healthEvent, eventDate: new Date(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type</Label>
            <Input
              id="eventType"
              type="text"
              value={healthEvent.eventType}
              onChange={(e) => setHealthEvent({ ...healthEvent, eventType: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={healthEvent.notes}
              onChange={(e) => setHealthEvent({ ...healthEvent, notes: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="severity">Severity (1-5)</Label>
            <Input
              id="severity"
              type="number"
              min="1"
              max="5"
              value={healthEvent.severity}
              onChange={(e) => setHealthEvent({ ...healthEvent, severity: Number.parseInt(e.target.value, 10) })}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{event ? "Update" : "Add"} Health Event</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default HealthEventForm

