'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function BehaviorForm() {
  const [showBehaviorForm, setShowBehaviorForm] = useState(false)

  const handleBehaviorSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle behavior form submission
    console.log('Behavior entry submitted')
    setShowBehaviorForm(false)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Behavior Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          Track and improve your dog's behavior. Record incidents, training sessions, and progress over time.
        </p>
        <div className="flex space-x-2">
          <Button onClick={() => setShowBehaviorForm(true)}>Add Behavior Entry</Button>
          <Button variant="outline">Behavior Event</Button>
        </div>
        {showBehaviorForm && (
          <form onSubmit={handleBehaviorSubmit} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="behaviorType">Behavior Type</Label>
              <Input id="behaviorType" name="behaviorType" required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" required />
            </div>
            <div>
              <Label htmlFor="intensity">Intensity (1-5)</Label>
              <Input id="intensity" name="intensity" type="number" min="1" max="5" required />
            </div>
            <div>
              <Label htmlFor="duration">Duration (in minutes)</Label>
              <Input id="duration" name="duration" type="number" min="0" required />
            </div>
            <div>
              <Label htmlFor="triggers">Triggers (if any)</Label>
              <Input id="triggers" name="triggers" />
            </div>
            <div>
              <Label htmlFor="interventions">Interventions or Training Applied</Label>
              <Textarea id="interventions" name="interventions" />
            </div>
            <Button type="submit">Submit Behavior Entry</Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

