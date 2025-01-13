'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Behavior() {
  const [showBehaviorForm, setShowBehaviorForm] = useState(false)

  const handleBehaviorSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle behavior log submission
    console.log('Behavior log submitted')
    setShowBehaviorForm(false)
  }

  return (
    <main>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Behavior Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Log and track your dog&apos;s behavior patterns.</p>
            <Button onClick={() => setShowBehaviorForm(true)}>Add Behavior Log</Button>
            {showBehaviorForm && (
              <form onSubmit={handleBehaviorSubmit} className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="behaviorType">Behavior Type</Label>
                  <Select>
                    <SelectTrigger id="behaviorType">
                      <SelectValue placeholder="Select behavior type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aggression">Aggression</SelectItem>
                      <SelectItem value="anxiety">Anxiety</SelectItem>
                      <SelectItem value="barking">Excessive Barking</SelectItem>
                      <SelectItem value="chewing">Destructive Chewing</SelectItem>
                      <SelectItem value="houseTraining">House Training Issues</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" required />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input id="duration" type="number" min="1" required />
                </div>
                <div>
                  <Label htmlFor="intensity">Intensity (1-5)</Label>
                  <Input id="intensity" type="number" min="1" max="5" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe the behavior in detail..." required />
                </div>
                <div>
                  <Label htmlFor="triggers">Potential Triggers</Label>
                  <Input id="triggers" placeholder="What might have caused this behavior?" />
                </div>
                <div>
                  <Label htmlFor="actions">Actions Taken</Label>
                  <Textarea id="actions" placeholder="What did you do in response?" />
                </div>
                <Button type="submit">Submit Behavior Log</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

