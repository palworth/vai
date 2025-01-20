"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api, type Dog } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { Timestamp } from "firebase/firestore"
import { useAuth } from "@/app/contexts/AuthContext"

type DogFormData = Omit<
  Dog,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "users"
  | "behaviorEventIds"
  | "dietEventIds"
  | "exerciseEventIds"
  | "healthEventIds"
  | "birthday"
> & {
  birthday: string | null
}

export default function AddDogPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: "", description: "", isError: false })

  const [dog, setDog] = useState<DogFormData>({
    name: "",
    breed: "",
    age: 0,
    sex: "male",
    weight: 0,
    birthday: null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!user) {
      showToast("Error", "You must be logged in to add a dog", true)
      setIsLoading(false)
      return
    }

    try {
      const dogData = {
        ...dog,
        birthday: dog.birthday ? Timestamp.fromDate(new Date(dog.birthday)) : null,
        userId: user.uid,
      }
      await api.dogs.create(dogData)
      showToast("Success", "Dog added successfully", false)
      setTimeout(() => {
        router.push("/dogs")
      }, 2000)
    } catch (error) {
      console.error("Error adding dog:", error)
      showToast("Error", `Failed to add dog: ${error instanceof Error ? error.message : "Unknown error"}`, true)
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
            <CardTitle>Add New Dog</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={dog.name} onChange={(e) => setDog({ ...dog, name: e.target.value })} required />
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
                  onChange={(e) => setDog({ ...dog, age: e.target.value === "" ? 0 : Number(e.target.value) })}
                  required
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex">Sex</Label>
                <Select value={dog.sex} onValueChange={(value: "male" | "female") => setDog({ ...dog, sex: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sex" />
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
                  onChange={(e) => setDog({ ...dog, weight: Number(e.target.value) })}
                  required
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthday">Birthday (optional)</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={dog.birthday || ""}
                  onChange={(e) => setDog({ ...dog, birthday: e.target.value || null })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.push("/dogs")} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Dog"}
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

