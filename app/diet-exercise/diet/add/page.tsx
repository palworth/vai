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
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

const FOOD_TYPES = ["dry kibble", "homemade", "raw", "custom", "wet"] as const
type FoodType = (typeof FOOD_TYPES)[number]

const foodTypes = ["dry kibble", "homemade", "raw", "custom", "wet"]

export default function AddDietEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null)
  const [selectedDogName, setSelectedDogName] = useState<string | null>(null)
  const [foodType, setFoodType] = useState<FoodType>("dry kibble")
  const [brandName, setBrandName] = useState("")
  const [quantity, setQuantity] = useState<number>(0)
  const [eventDate, setEventDate] = useState<string>(new Date().toISOString().slice(0, 16))
  const [isLoading, setIsLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!user || !selectedDogId) {
      showToast("Error", "Please select a dog and ensure you're logged in", true)
      setIsLoading(false)
      return
    }

    try {
      const dietEventData = {
        userId: user.uid,
        dogId: selectedDogId,
        foodType,
        brandName,
        quantity,
        eventDate: new Date(eventDate).toISOString(),
      }

      await api.dietEvents.create(dietEventData)
      showToast("Success", "Diet event added successfully", false)
      setTimeout(() => {
        router.push(`/dogs/${selectedDogId}`)
      }, 2000)
    } catch (error) {
      console.error("Error adding diet event:", error)
      showToast("Error", `Failed to add diet event: ${error instanceof Error ? error.message : "Unknown error"}`, true)
    } finally {
      setIsLoading(false)
    }
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
            <CardTitle>Add Diet Event</CardTitle>
            <CardDescription>Record a new diet event for your dog</CardDescription>
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
              <div className="space-y-2">
                <Label htmlFor="foodType">Food Type</Label>
                <Select value={foodType} onValueChange={(value: FoodType) => setFoodType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select food type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name (Optional)</Label>
                <Input
                  id="brandName"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Enter brand name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (in grams)</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Diet Event"}
                </Button>
              </div>
            </form>
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

