'use client'

import { useState, useEffect } from 'react'
import { addDoc, collection, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from 'date-fns'

interface BehaviorEvent {
  id?: string
  dogId: string
  dateTime: Date
  behaviorType: string
  severityLevel: 'mild' | 'moderate' | 'severe'
  notes: string
}

interface BehaviorEventFormProps {
  dogId: string
  event?: BehaviorEvent
  onSuccess: () => void
  onCancel: () => void
}

export function BehaviorEventForm({ dogId, event, onSuccess, onCancel }: BehaviorEventFormProps) {
  const [behaviorEvent, setBehaviorEvent] = useState<Omit<BehaviorEvent, 'id' | 'dogId'>>({
    dateTime: event?.dateTime || new Date(),
    behaviorType: event?.behaviorType || '',
    severityLevel: event?.severityLevel || 'mild',
    notes: event?.notes || ''
  })
  const [isCustomBehavior, setIsCustomBehavior] = useState(false)
  const [customBehaviorType, setCustomBehaviorType] = useState('')

  const behaviorTypes = [
    "Excessive Barking",
    "Chewing",
    "Anxiety Attack",
    "Aggression",
    "Disobedience"
  ]

  useEffect(() => {
    if (event) {
      const isCustom = !behaviorTypes.includes(event.behaviorType);
      setBehaviorEvent({
        dateTime: new Date(event.dateTime),
        behaviorType: isCustom ? 'custom' : event.behaviorType,
        severityLevel: event.severityLevel,
        notes: event.notes
      });
      setIsCustomBehavior(isCustom);
      setCustomBehaviorType(isCustom ? event.behaviorType : '');
    }
  }, [event])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalBehaviorType = isCustomBehavior ? customBehaviorType : behaviorEvent.behaviorType

    if (!finalBehaviorType) {
      alert('Please select or add a behavior type')
      return
    }

    try {
      const eventData = {
        ...behaviorEvent,
        behaviorType: finalBehaviorType,
        dateTime: Timestamp.fromDate(behaviorEvent.dateTime)
      }

      if (event?.id) {
        // For updates, we don't need to include the dogId
        await updateDoc(doc(db, 'behaviorEvents', event.id), eventData)
      } else {
        // For new events, we include the dogId
        await addDoc(collection(db, 'behaviorEvents'), {
          ...eventData,
          dogId: doc(db, 'dogs', dogId)
        })
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving behavior event:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="behaviorType">Behavior Type</Label>
        <Select 
          value={isCustomBehavior ? 'custom' : behaviorEvent.behaviorType} 
          onValueChange={(value) => {
            if (value === 'custom') {
              setIsCustomBehavior(true);
              setBehaviorEvent({ ...behaviorEvent, behaviorType: '' }); 
              setCustomBehaviorType(''); 
            } else {
              setIsCustomBehavior(false);
              setBehaviorEvent({ ...behaviorEvent, behaviorType: value });
              setCustomBehaviorType('');
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select behavior type" />
          </SelectTrigger>
          <SelectContent>
            {behaviorTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
            <SelectItem value="custom">Behavior not listed? Click here to add</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isCustomBehavior && (
        <div className="space-y-2">
          <Label htmlFor="customBehaviorType">Custom Behavior Type</Label>
          <Input
            id="customBehaviorType"
            value={customBehaviorType}
            onChange={(e) => {
              const value = e.target.value.slice(0, 100);
              setCustomBehaviorType(value);
              setBehaviorEvent({ ...behaviorEvent, behaviorType: value });
            }}
            maxLength={100}
            placeholder="Enter custom behavior type (max 100 characters)"
            required
          />
          <p className="text-sm text-gray-500">{customBehaviorType.length}/100 characters</p>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="dateTime">Date and Time</Label>
        <Input
          id="dateTime"
          type="datetime-local"
          value={format(behaviorEvent.dateTime, "yyyy-MM-dd'T'HH:mm")}
          onChange={(e) => setBehaviorEvent({ ...behaviorEvent, dateTime: new Date(e.target.value) })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="severityLevel">Severity Level</Label>
        <Select 
          value={behaviorEvent.severityLevel} 
          onValueChange={(value) => setBehaviorEvent({ ...behaviorEvent, severityLevel: value as 'mild' | 'moderate' | 'severe' })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select severity level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mild">Mild</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="severe">Severe</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={behaviorEvent.notes}
          onChange={(e) => setBehaviorEvent({ ...behaviorEvent, notes: e.target.value })}
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{event?.id ? 'Update' : 'Add'} Behavior Event</Button>
      </div>
    </form>
  )
}

