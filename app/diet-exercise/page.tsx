'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function DietExercise() {
  const [showDietForm, setShowDietForm] = useState(false)
  const [showExerciseForm, setShowExerciseForm] = useState(false)

  const handleDietSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle diet form submission
    console.log('Diet entry submitted')
    setShowDietForm(false)
  }

  const handleExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle exercise form submission
    console.log('Exercise entry submitted')
    setShowExerciseForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Diet & Exercise</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Diet Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">Track your dog's diet and meal information.</p>
                <Button onClick={() => setShowDietForm(true)}>Add Diet Entry</Button>
                {showDietForm && (
                  <form onSubmit={handleDietSubmit} className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="mealType">Meal Type</Label>
                      <Input id="mealType" name="mealType" required />
                    </div>
                    <div>
                      <Label htmlFor="foodAmount">Food Amount (in grams)</Label>
                      <Input id="foodAmount" name="foodAmount" type="number" required />
                    </div>
                    <div>
                      <Label htmlFor="dietNotes">Notes</Label>
                      <Textarea id="dietNotes" name="dietNotes" />
                    </div>
                    <Button type="submit">Submit Diet Entry</Button>
                  </form>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Exercise Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">Log your dog's exercise and activity.</p>
                <Button onClick={() => setShowExerciseForm(true)}>Add Exercise Entry</Button>
                {showExerciseForm && (
                  <form onSubmit={handleExerciseSubmit} className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="exerciseType">Exercise Type</Label>
                      <Input id="exerciseType" name="exerciseType" required />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (in minutes)</Label>
                      <Input id="duration" name="duration" type="number" required />
                    </div>
                    <div>
                      <Label htmlFor="intensity">Intensity (1-5)</Label>
                      <Input id="intensity" name="intensity" type="number" min="1" max="5" required />
                    </div>
                    <div>
                      <Label htmlFor="exerciseNotes">Notes</Label>
                      <Textarea id="exerciseNotes" name="exerciseNotes" />
                    </div>
                    <Button type="submit">Submit Exercise Entry</Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

