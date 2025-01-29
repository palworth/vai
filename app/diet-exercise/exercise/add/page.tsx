"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { api, type Dog } from "@/lib/api"
import { useAuth } from "@/app/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Optional arrays for activity types/sources
const SOURCES = ["Manual Add", "Strava", "Whoop", "Fitbit", "Garmin", "Apple Health"] as const
type Source = (typeof SOURCES)[number]

const ACTIVITY_TYPES = [
  "Walking",
  "Running/Jogging",
  "Fetch",
  "Hiking",
  "Dog Park Playtime",
  "Indoor Play",
  "Outside Alone Time",
  "Swimming",
] as const
type ActivityType = (typeof ACTIVITY_TYPES)[number]

export default function AddExerciseEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null)
  const [selectedDogName, setSelectedDogName] = useState<string | null>(null)
  
  // Make duration & distance optional by default
  const [duration, setDuration] = useState<number | undefined>(undefined)
  const [distance, setDistance] = useState<number | undefined>(undefined)
  const [source, setSource] = useState<Source>("Manual Add")
  const [activityType, setActivityType] = useState<ActivityType>("Walking")

  // We'll store the datetime-local as a string, then convert to Timestamp
  const [eventDate, setEventDate] = useState<string>(() => new Date().toISOString().slice(0, 16))

  const [isLoading, setIsLoading] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: "", description: "", isError: false })

  useEffect(() => {
    const fetchDogs = async () => {
      if (!user) return
      const dogIdFromParams = searchParams.get("dogId")

      if (dogIdFromParams) {
        // Fetch the specific dog
        const dogDocSnap = await getDoc(doc(db, "dogs", dogIdFromParams))
        if (dogDocSnap.exists()) {
          const dogData = { id: dogDocSnap.id, ...dogDocSnap.data() } as Dog
          setDogs([dogData])
          setSelectedDogId(dogData.id)
          setSelectedDogName(dogData.name)
        } else {
          showToast("Error", "Dog not found", true)
        }
      } else {
        // Fetch all dogs for the logged-in user
        const dogsQuery = query(
          collection(db, "dogs"),
          where("users", "array-contains", doc(db, "users", user.uid)),
        )
        const querySnapshot = await getDocs(dogsQuery)
        const dogsData = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Dog)
        setDogs(dogsData)
      }
    }

    fetchDogs()
  }, [user, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!user || !selectedDogId) {
      showToast("Error", "Please select a dog and ensure you're logged in", true)
      setIsLoading(false)
      return
    }

    try {
      // Convert the user's chosen date/time to a Firestore Timestamp
      const eventDateTimestamp = Timestamp.fromDate(new Date(eventDate))

      // If duration/distance are not provided, default to 0 (or omit them if truly optional)
      const exerciseEventData = {
        userId: user.uid,
        dogId: selectedDogId,
        duration: duration ?? 0,
        distance: distance ?? 0,
        source,
        activityType,
        // Pass a Timestamp for eventDate
        eventDate: eventDateTimestamp,
      }

      // Use your API's create function
      await api.exerciseEvents.create(exerciseEventData)

      showToast("Success", "Exercise event added successfully", false)
      setTimeout(() => {
        router.push(`/dogs/${selectedDogId}`)
      }, 1500)
    } catch (error) {
      console.error("Error adding exercise event:", error)
      showToast(
        "Error",
        `Failed to add exercise event: ${error instanceof Error ? error.message : "Unknown error"}`,
        true
      )
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (title: string, description: string, isError: boolean) => {
    setToastMessage({ title, description, isError })
    setToastOpen(true)
  }

  if (!user) {
    return <div>Please log in to add an exercise event.</div>
  }

  return (
    <ToastProvider>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Exercise Event</CardTitle>
            <CardDescription>Record a new exercise event for your dog</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedDogName ? (
                <div className="space-y-2">
                  <Label>Selected Dog</Label>
                  <p className="text-lg font-medium">{selectedDogName}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="dogSelect">Select Dog</Label>
                  <Select value={selectedDogId || ""} onValueChange={(value) => setSelectedDogId(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a dog" />
                    </SelectTrigger>
                    <SelectContent>
                      {dogs.map((dog) => (
                        <SelectItem key={dog.id} value={dog.id}>
                          {dog.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Event Date & Time */}
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date and Time</Label>
                <Input
                  id="eventDate"
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>

              {/* Activity Type */}
              <div className="space-y-2">
                <Label htmlFor="activityType">Activity Type</Label>
                <Select value={activityType} onValueChange={(value: ActivityType) => setActivityType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration (optional) */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) [Optional]</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration ?? ""}
                  onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : undefined)}
                  min="0"
                />
              </div>

              {/* Distance (optional) */}
              <div className="space-y-2">
                <Label htmlFor="distance">Distance (miles) [Optional]</Label>
                <Input
                  id="distance"
                  type="number"
                  value={distance ?? ""}
                  onChange={(e) => setDistance(e.target.value ? Number(e.target.value) : undefined)}
                  min="0"
                  step="0.1"
                />
              </div>

              {/* Source (optional) */}
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select value={source} onValueChange={(value: Source) => setSource(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((src) => (
                      <SelectItem key={src} value={src}>
                        {src}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Exercise Event"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Toast */}
      <Toast open={toastOpen} onOpenChange={setToastOpen}>
        <div
          className={`${
            toastMessage.isError ? "bg-red-100 border-red-400" : "bg-green-100 border-green-400"
          } border-l-4 p-4`}
        >
          <ToastTitle className={`${toastMessage.isError ? "text-red-800" : "text-green-800"} font-bold`}>
            {toastMessage.title}
          </ToastTitle>
          <ToastDescription className={`${toastMessage.isError ? "text-red-700" : "text-green-700"}`}>
            {toastMessage.description}
          </ToastDescription>
        </div>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  )
}
