'use client'

import { useState, useEffect } from 'react'
import { addDoc, collection, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from 'date-fns'

interface DietEvent {
  id?: string
  dogId: string
  dateTime: Date
  foodType: 'raw' | 'dry' | 'specialty'
  brandName?: string
  quantity: number
}

interface DietEventFormProps {
  dogId: string
  event?: DietEvent
  onSuccess: () => void
  onCancel: () => void
}

export function DietEventForm({ dogId, event, onSuccess, onCancel }: DietEventFormProps) {
  const [dietEvent, setDietEvent] = useState<Omit<DietEvent, 'id' | 'dogId'>>({
    dateTime: event?.dateTime || new Date(),
    foodType: event?.foodType || 'dry',
    brandName: event?.brandName || '',
    quantity: event?.quantity || 0
  })

  useEffect(() => {
    if (event) {
      setDietEvent({
        dateTime: new Date(event.dateTime),
        foodType: event.foodType,
        brandName: event.brandName || '',
        quantity: event.quantity
      })
    }
  }, [event])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const eventData = {
        ...dietEvent,
        dateTime: Timestamp.fromDate(dietEvent.dateTime)
      }

      if (event?.id) {
        await updateDoc(doc(db, 'dietEvents', event.id), eventData)
      } else {
        await addDoc(collection(db, 'dietEvents'), {
          ...eventData,
          dogId: doc(db, 'dogs', dogId)
        })
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving diet event:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dateTime">Date and Time</Label>
        <Input
          id="dateTime"
          type="datetime-local"
          value={format(dietEvent.dateTime, "yyyy-MM-dd'T'HH:mm")}
          onChange={(e) => setDietEvent({ ...dietEvent, dateTime: new Date(e.target.value) })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="foodType">Food Type</Label>
        <Select 
          value={dietEvent.foodType} 
          onValueChange={(value: 'raw' | 'dry' | 'specialty') => setDietEvent({ ...dietEvent, foodType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select food type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="raw">Raw</SelectItem>
            <SelectItem value="dry">Dry</SelectItem>
            <SelectItem value="specialty">Specialty</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="brandName">Brand Name (Optional)</Label>
        <Input
          id="brandName"
          value={dietEvent.brandName}
          onChange={(e) => setDietEvent({ ...dietEvent, brandName: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity (grams/cups)</Label>
        <Input
          id="quantity"
          type="number"
          value={dietEvent.quantity}
          onChange={(e) => setDietEvent({ ...dietEvent, quantity: parseFloat(e.target.value) })}
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{event?.id ? 'Update' : 'Add'} Diet Event</Button>
      </div>
    </form>
  )
}

