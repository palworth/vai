"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { api, type Dog } from "@/lib/api"
import { useAuth } from "@/app/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { WellnessEventForm, type WellnessEventFormData } from "@/app/components/WellnessEventForm"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function AddWellnessEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null)
  const [selectedDogName, setSelectedDogName] = useState<string | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: "", description: "", isError: false })

  useEffect(() => {
    const fetchDogs = async () => {
      if (!user) return
      const dogIdFromParams = searchParams.get("dogId")

      if (dogIdFromParams) {
        // Fetch the specific dog
        const dogDoc = await getDoc(doc(db, "dogs", dogIdFromParams))
        if (dogDoc.exists()) {
          const dogData = { id: dogDoc.id, ...dogDoc.data() } as Dog
          setDogs([dogData])
          setSelectedDogId(dogData.id)
          setSelectedDogName(dogData.name)
        } else {
          showToast("Error", "Dog not found", true)
        }
      } else {
        // Fetch all dogs for the user
        const dogsQuery = query(collection(db, "dogs"), where("users", "array-contains", doc(db, "users", user.uid)))
        const querySnapshot = await getDocs(dogsQuery)
        const dogsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Dog)
        setDogs(dogsData)
      }
    }

    fetchDogs()
  }, [user, searchParams])

  const handleSuccess = (wellnessEventData: WellnessEventFormData) => {
    if (!user || !selectedDogId) {
      showToast("Error", "User or dog not selected", true)
      return
    }

    api.wellnessEvents
      .create({
        ...wellnessEventData,
        userId: user.uid,
        dogId: selectedDogId,
      })
      .then(() => {
        showToast("Success", "Wellness event added successfully", false)
        setTimeout(() => {
          router.push(`/dogs/${selectedDogId}`)
        }, 2000)
      })
      .catch((error) => {
        console.error("Error adding wellness event:", error)
        showToast("Error", "Failed to add wellness event", true)
      })
  }

  const showToast = (title: string, description: string, isError: boolean) => {
    setToastMessage({ title, description, isError })
    setToastOpen(true)
  }

  return (
    <ToastProvider>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Wellness Event</CardTitle>
            <CardDescription>Record a new wellness event for your dog</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDogName ? (
              <p className="mb-4">Selected Dog: {selectedDogName}</p>
            ) : (
              <div className="mb-4">
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
            {selectedDogId && (
              <WellnessEventForm onSuccess={handleSuccess} onCancel={() => router.push("/health-wellness")} />
            )}
          </CardContent>
        </Card>
      </div>

      <Toast open={toastOpen} onOpenChange={setToastOpen}>
        <div
          className={`${toastMessage.isError ? "bg-red-100 border-red-400" : "bg-green-100 border-green-400"} border-l-4 p-4`}
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

