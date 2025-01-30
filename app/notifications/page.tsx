"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/app/contexts/AuthContext"

// Shadcn UI components (same ones used in AddBehaviorEventPage)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface Dog {
  id: string
  name: string
  // Add any other fields you have for dogs
}

interface Notification {
  id: string
  title: string
  message: string
  read?: boolean
  type?: string
  dogId?: string
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null)
  const [selectedDogName, setSelectedDogName] = useState<string | null>(null)

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [fetching, setFetching] = useState(false)
  const [loadingDogs, setLoadingDogs] = useState(true)
  const [loadingNotifs, setLoadingNotifs] = useState(true)

  // ------------------------------------------
  // 1) FETCH DOG(S) SIMILAR TO AddBehaviorEventPage
  // ------------------------------------------
  useEffect(() => {
    if (!user) {
      setLoadingDogs(false)
      return
    }

    const fetchDogs = async () => {
      try {
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
            console.error("Dog not found:", dogIdFromParams)
          }
        } else {
          // Fetch all dogs for the user
          // If your 'dogs' collection uses an array of references, you can do:
          // where("users", "array-contains", doc(db, "users", user.uid))
          // or if it's just an array of userId strings, do: where("users", "array-contains", user.uid)
          const dogsQuery = query(
            collection(db, "dogs"),
            where("users", "array-contains", doc(db, "users", user.uid))
          )
          const querySnapshot = await getDocs(dogsQuery)
          const dogsData = querySnapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as Dog[]
          setDogs(dogsData)

          // Optionally auto-select the first dog
          if (dogsData.length === 1) {
            setSelectedDogId(dogsData[0].id)
            setSelectedDogName(dogsData[0].name)
          }
        }
      } catch (err) {
        console.error("Error fetching dogs:", err)
      } finally {
        setLoadingDogs(false)
      }
    }

    fetchDogs()
  }, [user, searchParams])

  // ------------------------------------------
  // 2) FETCH NOTIFICATIONS FOR THIS USER
  // ------------------------------------------
  useEffect(() => {
    if (!user) {
      setLoadingNotifs(false)
      return
    }

    const fetchNotifications = async () => {
      setFetching(true)
      try {
        const res = await fetch(`/api/notifications?userId=${user.uid}`)
        if (!res.ok) {
          console.error("Failed to fetch notifications. Status:", res.status)
          setFetching(false)
          setLoadingNotifs(false)
          return
        }
        const data = await res.json()
        setNotifications(data.notifications || [])
      } catch (err) {
        console.error("Error fetching notifications:", err)
      } finally {
        setFetching(false)
        setLoadingNotifs(false)
      }
    }

    fetchNotifications()
  }, [user])

  // ------------------------------------------
  // 3) CREATE NOTIFICATION (POST) 
  // ------------------------------------------
  async function handleCreateNotification(type: string) {
    if (!user) {
      console.warn("handleCreateNotification called, but no user is logged in.")
      return
    }
    if (!selectedDogId) {
      console.warn("No dog selected to create notification for.")
      return
    }

    const bodyObj = {
      userId: user.uid,
      dogId: selectedDogId,
      type, // 'diet', 'exercise', etc.
    }
    console.log("Creating notification with:", bodyObj)

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj),
      })

      if (!res.ok) {
        console.error("Failed to create notification. Status:", res.status)
        const errData = await res.json()
        console.error("Server error response:", errData)
        return
      }

      const data = await res.json()
      console.log("Created notification:", data)

      // Refetch notifications
      const updatedRes = await fetch(`/api/notifications?userId=${user.uid}`)
      const updatedData = await updatedRes.json()
      setNotifications(updatedData.notifications || [])
    } catch (err) {
      console.error("Error creating notification:", err)
    }
  }

  // ------------------------------------------
  // RENDER
  // ------------------------------------------
  if (!user) {
    return <div>Please log in to view notifications.</div>
  }

  return (
    <div className="p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Create or view notifications for your dogs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingDogs ? (
            <p>Loading dogs...</p>
          ) : dogs.length === 0 ? (
            <p>No dogs found. Please add a dog first.</p>
          ) : selectedDogName ? (
            // If we already set a single dog's name from search params or there's only one dog
            <div className="space-y-2 mb-4">
              <Label>Selected Dog</Label>
              <p className="text-lg font-medium">{selectedDogName}</p>
            </div>
          ) : (
            // Show a dropdown if multiple dogs
            <div className="space-y-2 mb-4">
              <Label htmlFor="dogSelect">Select Dog</Label>
              <Select
                value={selectedDogId || ""}
                onValueChange={(value) => {
                  setSelectedDogId(value)
                  const foundDog = dogs.find((dog) => dog.id === value)
                  if (foundDog) {
                    setSelectedDogName(foundDog.name)
                  }
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

          <div className="flex gap-4 mb-4">
            <button
              onClick={() => handleCreateNotification("diet")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Create Diet Notification
            </button>
            <button
              onClick={() => handleCreateNotification("exercise")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Create Exercise Notification
            </button>
            <button
              onClick={() => handleCreateNotification("test")}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              Create Test Notification
            </button>
          </div>
        </CardContent>
      </Card>

      {loadingNotifs ? (
        <p>Loading notifications...</p>
      ) : fetching ? (
        <p>Refreshing notifications...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-2">Your Notifications</h2>
          <ul className="space-y-2">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className="border rounded-xl p-3 shadow-sm bg-white"
              >
                <h3 className="font-semibold mb-1">{notif.title}</h3>
                <p>{notif.message}</p>
                <span className="block text-sm mt-1 text-gray-600">
                  Type: {notif.type}
                </span>
                {notif.read ? (
                  <span className="text-green-600 text-sm">Read</span>
                ) : (
                  <span className="text-blue-600 text-sm">Unread</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
