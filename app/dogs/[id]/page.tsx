'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/app/contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { format } from 'date-fns'
import { HealthEventForm } from '@/app/components/HealthEventForm'

interface Dog {
 id: string
 name: string
 breed: string
 age: number
 sex: string
 weight: number
}

interface HealthEvent {
 id: string
 dogId: string
 eventType: string
 eventDate: Date
 notes: string
 severity?: 'mild' | 'moderate' | 'severe'
}

type DogUpdateData = Omit<Dog, 'id'>

export default function DogPage() {
 const params = useParams()
 const id = params.id as string

 const [dog, setDog] = useState<Dog | null>(null)
 const [isEditing, setIsEditing] = useState(false)
 const [toastOpen, setToastOpen] = useState(false)
 const [toastMessage, setToastMessage] = useState({ title: '', description: '', isError: false })
 const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([])
 const [showHealthEventForm, setShowHealthEventForm] = useState(false)
 const [editingHealthEvent, setEditingHealthEvent] = useState<HealthEvent | null>(null)
 const router = useRouter()
 const { user } = useAuth()

 const fetchDog = useCallback(async () => {
   if (!user) return
   const dogDoc = await getDoc(doc(db, 'dogs', id))
   if (dogDoc.exists()) {
     setDog({ id: dogDoc.id, ...dogDoc.data() } as Dog)
   } else {
     router.push('/dogs')
   }
 }, [user, id, router])

 const fetchHealthEvents = useCallback(async () => {
   if (!user) return
   const dogRef = doc(db, 'dogs', id)
   const healthEventsQuery = query(collection(db, 'healthEvents'), where('dogId', '==', dogRef))
   const querySnapshot = await getDocs(healthEventsQuery)
   const eventsData = querySnapshot.docs.map(doc => ({
     id: doc.id,
     ...doc.data(),
     dogId: id,
     eventDate: doc.data().eventDate.toDate()
   } as HealthEvent))
   setHealthEvents(eventsData)
 }, [user, id])

 useEffect(() => {
   if (user) {
     fetchDog()
     fetchHealthEvents()
   }
 }, [user, fetchDog, fetchHealthEvents])

 const handleUpdate = async (e: React.FormEvent) => {
   e.preventDefault()
   if (!dog) return
   
   const updateData: DogUpdateData = {
     name: dog.name,
     breed: dog.breed,
     age: dog.age,
     sex: dog.sex,
     weight: dog.weight
   }

   try {
     await updateDoc(doc(db, 'dogs', dog.id), updateData)
     setIsEditing(false)
     showToast('Dog Updated', 'Your dog&apos;s information has been successfully updated.', false)
   } catch (error) {
     console.error('Error updating dog:', error)
     showToast('Error', 'There was a problem updating your dog&apos;s information.', true)
   }
 }

 const handleDelete = async () => {
   if (!dog) return
   try {
     await deleteDoc(doc(db, 'dogs', dog.id))
     router.push('/dogs')
   } catch (error) {
     console.error('Error deleting dog:', error)
     showToast('Error', 'There was a problem deleting your dog.', true)
   }
 }

 const handleEditHealthEvent = (event: HealthEvent) => {
  setEditingHealthEvent(event)
  setShowHealthEventForm(true)
}

 const handleDeleteHealthEvent = async (eventId: string) => {
   try {
     await deleteDoc(doc(db, 'healthEvents', eventId))
     fetchHealthEvents()
     showToast('Health Event Deleted', 'The health event has been successfully deleted.', false)
   } catch (error) {
     console.error('Error deleting health event:', error)
     showToast('Error', 'There was a problem deleting the health event.', true)
   }
 }

 const showToast = (title: string, description: string, isError: boolean = false) => {
   setToastMessage({ title, description, isError })
   setToastOpen(true)
   
   // Automatically close the toast after 2 seconds
   setTimeout(() => {
     setToastOpen(false)
   }, 2000)
 }

 useEffect(() => {
   if (toastOpen) {
     const timer = setTimeout(() => {
       setToastOpen(false)
     }, 2000)

     return () => clearTimeout(timer)
   }
 }, [toastOpen])

 if (!dog) {
   return <div>Loading...</div>
 }

 return (
   <ToastProvider>
     <div className="space-y-6">
       <Card>
         <CardHeader>
           <CardTitle>{isEditing ? 'Edit Dog Information' : 'Dog Information'}</CardTitle>
           <CardDescription>{isEditing ? 'Update your dog&apos;s details below' : 'View your dog&apos;s details'}</CardDescription>
         </CardHeader>
         <CardContent>
           {isEditing ? (
             <form onSubmit={handleUpdate} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="name">Name</Label>
                 <Input
                   id="name"
                   value={dog.name}
                   onChange={(e) => setDog({ ...dog, name: e.target.value })}
                   required
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="breed">Breed</Label>
                 <Input
                   id="breed"
                   value={dog.breed}
                   onChange={(e) => setDog({ ...dog, breed: e.target.value })}
                   required
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="age">Age</Label>
                 <Input
                   id="age"
                   type="number"
                   value={dog.age}
                   onChange={(e) => setDog({ ...dog, age: parseInt(e.target.value) })}
                   required
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="sex">Sex</Label>
                 <Select onValueChange={(value) => setDog({ ...dog, sex: value })}>
                   <SelectTrigger>
                     <SelectValue placeholder={dog.sex} />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="male">Male</SelectItem>
                     <SelectItem value="female">Female</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label htmlFor="weight">Weight (lbs)</Label>
                 <Input
                   id="weight"
                   type="number"
                   value={dog.weight}
                   onChange={(e) => setDog({ ...dog, weight: parseFloat(e.target.value) })}
                   required
                 />
               </div>
               <Button type="submit">Update Dog</Button>
             </form>
           ) : (
             <div className="space-y-2">
               <p><strong>Name:</strong> {dog.name}</p>
               <p><strong>Breed:</strong> {dog.breed}</p>
               <p><strong>Age:</strong> {dog.age}</p>
               <p><strong>Sex:</strong> {dog.sex}</p>
               <p><strong>Weight:</strong> {dog.weight} lbs</p>
             </div>
           )}
         </CardContent>
         <CardFooter className="flex justify-between">
           {isEditing ? (
             <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
           ) : (
             <Button onClick={() => setIsEditing(true)}>Edit</Button>
           )}
           <Button variant="destructive" onClick={handleDelete}>Delete Dog</Button>
         </CardFooter>
       </Card>

       <Card>
         <CardHeader>
           <CardTitle>Health Events</CardTitle>
           <CardDescription>Manage your dog&apos;s health events</CardDescription>
         </CardHeader>
         <CardContent>
           <Button onClick={() => {
             setEditingHealthEvent(null)
             setShowHealthEventForm(!showHealthEventForm)
           }}>
             {showHealthEventForm && !editingHealthEvent ? 'Cancel' : 'Add Health Event'}
           </Button>

           {showHealthEventForm && (
             <HealthEventForm
               dogId={dog.id}
               event={editingHealthEvent || undefined}
               onSuccess={() => {
                 setShowHealthEventForm(false)
                 setEditingHealthEvent(null)
                 fetchHealthEvents()
                 showToast(
                   editingHealthEvent ? 'Health Event Updated' : 'Health Event Added',
                   `The health event has been successfully ${editingHealthEvent ? 'updated' : 'added'}.`,
                   false
                 )
               }}
               onCancel={() => {
                 setShowHealthEventForm(false)
                 setEditingHealthEvent(null)
               }}
             />
           )}

           <div className="mt-6 space-y-4">
             {healthEvents.map((event) => (
               <Card key={event.id}>
                 <CardHeader>
                   <CardTitle>{event.eventType}</CardTitle>
                   <CardDescription>{format(event.eventDate, 'MMMM d, yyyy')}</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <p>{event.notes}</p>
                   {event.severity && <p><strong>Severity:</strong> {event.severity}</p>}
                 </CardContent>
                 <CardFooter className="flex justify-end space-x-2">
                   <Button variant="outline" onClick={() => handleEditHealthEvent(event)}>Edit</Button>
                   <Button variant="destructive" onClick={() => handleDeleteHealthEvent(event.id)}>Delete</Button>
                 </CardFooter>
               </Card>
             ))}
           </div>
         </CardContent>
       </Card>
     </div>

     <Toast open={toastOpen} onOpenChange={setToastOpen}>
       <div className={`${toastMessage.isError ? 'bg-red-100 border-red-400' : 'bg-green-100 border-green-400'} border-l-4 p-4`}>
         <ToastTitle className={`${toastMessage.isError ? 'text-red-800' : 'text-green-800'} font-bold`}>{toastMessage.title}</ToastTitle>
         <ToastDescription className={`${toastMessage.isError ? 'text-red-700' : 'text-green-700'}`}>{toastMessage.description}</ToastDescription>
       </div>
     </Toast>
     <ToastViewport />
   </ToastProvider>
 )
}

