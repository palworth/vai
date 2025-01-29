"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { type Dog } from "@/lib/api"
import { useAuth } from "@/app/contexts/AuthContext"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WellnessEventForm } from "@/app/components/WellnessEventForm"

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
        // Fetch all dogs for user
        const q = query(collection(db, "dogs"), where("users", "array-contains", doc(db, "users", user.uid)))
        const snap = await getDocs(q)
        const dogsData = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Dog[]
        setDogs(dogsData)
      }
    }
    fetchDogs()
  }, [user, searchParams])

  function showToast(title: string, description: string, isError: boolean) {
    setToastMessage({ title, description, isError })
    setToastOpen(true)
  }

  function handleSuccess() {
    showToast("Success", "Wellness event added successfully", false)
    setTimeout(() => {
      if (selectedDogId) {
        router.push(`/dogs/${selectedDogId}`)
      } else {
        router.push("/dogs")
      }
    }, 1500)
  }

  if (!user) {
    return <div>Please log in to add a wellness event.</div>
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
              <div className="space-y-2 mb-4">
                <Label>Selected Dog</Label>
                <p className="text-lg font-medium">{selectedDogName}</p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                <Label htmlFor="dogSelect">Select Dog</Label>
                <Select value={selectedDogId || ""} onValueChange={(val) => setSelectedDogId(val)}>
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

            {selectedDogId && user && (
              <WellnessEventForm
                dogId={selectedDogId}
                userId={user.uid}
                onSuccess={handleSuccess}
                onCancel={() => router.push(`/dogs/${selectedDogId}`)}
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
