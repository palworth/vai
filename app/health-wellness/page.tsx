'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function HealthWellness() {
  const [showHealthEventForm, setShowHealthEventForm] = useState(false)
  const [showMentalEventForm, setShowMentalEventForm] = useState(false)

  const handleHealthEventSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Health event submitted')
    setShowHealthEventForm(false)
  }

  const handleMentalEventSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Mental event submitted')
    setShowMentalEventForm(false)
  }

  return (
    <main>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Monitor Health Events and Mental Wellness</h3>
            <div className="mt-5 space-y-4">
              <Button onClick={() => setShowHealthEventForm(true)}>Add Health Event</Button>
              <Button onClick={() => setShowMentalEventForm(true)}>Mental Wellness Check-in</Button>
            </div>

            {showHealthEventForm && (
              <form onSubmit={handleHealthEventSubmit} className="mt-5 space-y-4">
                <h4 className="text-md font-medium text-gray-900">Add Health Event</h4>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Input id="type" name="type" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" required />
                </div>
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Input id="severity" name="severity" type="number" min="1" max="10" required />
                </div>
                <div>
                  <Label htmlFor="cost">Cost</Label>
                  <Input id="cost" name="cost" type="number" step="0.01" min="0" required />
                </div>
                <div className="flex items-center">
                  <Input id="followUpRequired" name="followUpRequired" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  <Label htmlFor="followUpRequired" className="ml-2">Follow-up Required</Label>
                </div>
                <div>
                  <Label htmlFor="followUpDate">Follow-up Date</Label>
                  <Input id="followUpDate" name="followUpDate" type="date" />
                </div>
                <Button type="submit">Submit Health Event</Button>
              </form>
            )}

            {showMentalEventForm && (
              <form onSubmit={handleMentalEventSubmit} className="mt-5 space-y-4">
                <h4 className="text-md font-medium text-gray-900">Mental Wellness Check-in</h4>
                {/* Add form fields for MentalEvent */}
                <Button type="submit">Submit Mental Wellness Check-in</Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

