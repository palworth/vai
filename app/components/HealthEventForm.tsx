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

interface HealthEvent {
 id?: string
 dogId: string
 eventType: string
 eventDate: Date
 notes: string
 severity?: 'mild' | 'moderate' | 'severe'
}

interface HealthEventFormProps {
 dogId: string
 event?: HealthEvent
 onSuccess: () => void
 onCancel: () => void
}

export function HealthEventForm({ dogId, event, onSuccess, onCancel }: HealthEventFormProps) {
 const [healthEvent, setHealthEvent] = useState<Omit<HealthEvent, 'id' | 'dogId'>>({
   eventType: event?.eventType || '',
   eventDate: event?.eventDate || new Date(),
   notes: event?.notes || '',
   severity: event?.severity || undefined
 })

 useEffect(() => {
   if (event) {
     setHealthEvent({
       eventType: event.eventType,
       eventDate: new Date(event.eventDate),
       notes: event.notes,
       severity: event.severity
     })
   }
 }, [event])

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault()

   try {
     if (event?.id) {
       // Update existing event
       await updateDoc(doc(db, 'healthEvents', event.id), {
         ...healthEvent,
         eventDate: Timestamp.fromDate(healthEvent.eventDate)
       })
     } else {
       // Add new event
       await addDoc(collection(db, 'healthEvents'), {
         ...healthEvent,
         dogId: doc(db, 'dogs', dogId),
         eventDate: Timestamp.fromDate(healthEvent.eventDate)
       })
     }
     onSuccess()
   } catch (error) {
     console.error('Error saving health event:', error)
   }
 }

 return (
   <form onSubmit={handleSubmit} className="space-y-4">
     <div className="space-y-2">
       <Label htmlFor="eventType">Event Type</Label>
       <Input
         id="eventType"
         value={healthEvent.eventType}
         onChange={(e) => setHealthEvent({ ...healthEvent, eventType: e.target.value })}
         required
       />
     </div>
     <div className="space-y-2">
       <Label htmlFor="eventDate">Event Date</Label>
       <Input
         id="eventDate"
         type="date"
         value={format(healthEvent.eventDate, 'yyyy-MM-dd')}
         onChange={(e) => setHealthEvent({ ...healthEvent, eventDate: new Date(e.target.value) })}
         required
       />
     </div>
     <div className="space-y-2">
       <Label htmlFor="notes">Notes</Label>
       <Textarea
         id="notes"
         value={healthEvent.notes}
         onChange={(e) => setHealthEvent({ ...healthEvent, notes: e.target.value })}
         required
       />
     </div>
     <div className="space-y-2">
       <Label htmlFor="severity">Severity</Label>
       <Select 
         value={healthEvent.severity || ''} 
         onValueChange={(value) => setHealthEvent({ ...healthEvent, severity: value as 'mild' | 'moderate' | 'severe' | undefined })}
       >
         <SelectTrigger>
           <SelectValue placeholder="Select severity" />
         </SelectTrigger>
         <SelectContent>
           <SelectItem value="mild">Mild</SelectItem>
           <SelectItem value="moderate">Moderate</SelectItem>
           <SelectItem value="severe">Severe</SelectItem>
         </SelectContent>
       </Select>
     </div>
     <div className="flex justify-end space-x-2">
       <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
       <Button type="submit">{event?.id ? 'Update' : 'Add'} Health Event</Button>
     </div>
   </form>
 )
}

