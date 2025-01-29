"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { type Dog } from "@/lib/api" // Only import the Dog type if needed
import { useAuth } from "@/app/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DietEventForm } from "@/app/components/DietEventForm"

export default function AddDietEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null)
  const [selectedDogName, setSelectedDogName] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: "", description: "", isError: false })

  useEffect(() => {
    const fetchDogs = async () => {
      if (!user) return

      const dogIdFromParams = searchParams.get("dogId")

      if (dogIdFromParams) {
        // 1. If a dogId is provided, fetch that specific dog
        const dogDocRef = doc(db, "dogs", dogIdFromParams)
        const dogDocSnap = await getDoc(dogDocRef)
        if (dogDocSnap.exists()) {
          const dogData = { id: dogDocSnap.id, ...dogDocSnap.data() } as Dog
          setDogs([dogData])
          setSelectedDogId(dogData.id)
          setSelectedDogName(dogData.name)
        } else {
          showToast("Error", "Dog not found", true)
        }
      } else {
        // 2. If no dogId param, fetch all dogs for this user
        const dogsQuery = query(
          collection(db, "dogs"),
          where("users", "array-contains", doc(db, "users", user.uid))
        )
        const querySnapshot = await getDocs(dogsQuery)
        const dogsData = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Dog[]
        setDogs(dogsData)
      }
    }

    fetchDogs()
  }, [user, searchParams])

  const showToast = (title: string, description: string, isError: boolean) => {
    setToastMessage({ title, description, isError })
    setToastOpen(true)
  }

  const handleSuccess = () => {
    // Show a toast and then navigate away
    showToast("Success", "Diet event added successfully", false)
    setTimeout(() => {
      router.push(`/dogs/${selectedDogId}`)
    }, 2000)
  }

  if (!user) {
    return <div>Please log in to add a diet event.</div>
  }

  return (
    <ToastProvider>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Diet Event</CardTitle>
            <CardDescription>Record a new diet event for your dog</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDogName ? (
              // If we already have a selected dog (from params), just show its name
              <div className="space-y-2 mb-4">
                <Label>Selected Dog</Label>
                <p className="text-lg font-medium">{selectedDogName}</p>
              </div>
            ) : (
              // Otherwise, show a dropdown to pick from all user's dogs
              <div className="space-y-2 mb-4">
                <Label htmlFor="dogSelect">Select Dog</Label>
                <Select
                  value={selectedDogId || ""}
                  onValueChange={(value) => {
                    setSelectedDogId(value)
                  }}
                >
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

            {/* Show the DietEventForm once we have a selected dog */}
            {selectedDogId && (
              <DietEventForm
                dogId={selectedDogId}
                userId={user.uid}
                onSuccess={handleSuccess}
                onCancel={() => router.back()}
              />
            )}
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
          <ToastTitle
            className={`${toastMessage.isError ? "text-red-800" : "text-green-800"} font-bold`}
          >
            {toastMessage.title}
          </ToastTitle>
          <ToastDescription
            className={`${toastMessage.isError ? "text-red-700" : "text-green-700"}`}
          >
            {toastMessage.description}
          </ToastDescription>
        </div>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  )
}
