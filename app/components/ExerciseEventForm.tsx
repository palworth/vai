'use client'

import { useState, useEffect } from 'react'
import { addDoc, collection, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from 'date-fns'

interface ExerciseEvent {
  id?: string
  dogId: string
  dateTime: Date
  activityType: string
  duration: number
  distance?: number
  source: string
}

interface ExerciseEventFormProps {
  dogId: string
  event?: ExerciseEvent
  onSuccess: () => void
  onCancel: () => void
}

export function ExerciseEventForm({ dogId, event, onSuccess, onCancel }: ExerciseEventFormProps) {
  const [exerciseEvent, setExerciseEvent] = useState<Omit<ExerciseEvent, 'id' | 'dogId'>>({
    dateTime: event?.dateTime || new Date(),
    activityType: event?.activityType || 'walk',
    duration: event?.duration || 0,
    distance: event?.distance || undefined,
    source: event?.source || 'manual'
  })

  useEffect(() => {
    if (event) {
      setExerciseEvent({
        dateTime: new Date(event.dateTime),
        activityType: event.activityType,
        duration: event.duration,
        distance: event.distance,
        source: event.source
      })
    }
  }, [event])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const eventData = {
        ...exerciseEvent,
        dateTime: Timestamp.fromDate(exerciseEvent.dateTime)
      }

      if (event?.id) {
        await updateDoc(doc(db, 'exerciseEvents', event.id), eventData)
      } else {
        await addDoc(collection(db, 'exerciseEvents'), {
          ...eventData,
          dogId: doc(db, 'dogs', dogId)
        })
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving exercise event:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dateTime">Date and Time</Label>
        <Input
          id="dateTime"
          type="datetime-local"
          value={format(exerciseEvent.dateTime, "yyyy-MM-dd'T'HH:mm")}
          onChange={(e) => setExerciseEvent({ ...exerciseEvent, dateTime: new Date(e.target.value) })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="activityType">Activity Type</Label>
        <Select 
          value={exerciseEvent.activityType} 
          onValueChange={(value: string) => setExerciseEvent({ ...exerciseEvent, activityType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select activity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="walk">Walk</SelectItem>
            <SelectItem value="run">Run</SelectItem>
            <SelectItem value="hike">Hike</SelectItem>
            <SelectItem value="play">Play</SelectItem>
            <SelectItem value="swim">Swim</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          value={exerciseEvent.duration}
          onChange={(e) => setExerciseEvent({ ...exerciseEvent, duration: parseFloat(e.target.value) })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="distance">Distance (km, optional)</Label>
        <Input
          id="distance"
          type="number"
          step="0.01"
          value={exerciseEvent.distance || ''}
          onChange={(e) => setExerciseEvent({ ...exerciseEvent, distance: e.target.value ? parseFloat(e.target.value) : undefined })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <Select 
          value={exerciseEvent.source} 
          onValueChange={(value: string) => setExerciseEvent({ ...exerciseEvent, source: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="Strava">Strava</SelectItem>
            <SelectItem value="Whoop">Whoop</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{event?.id ? 'Update' : 'Add'} Exercise Event</Button>
      </div>
    </form>
  )
}

