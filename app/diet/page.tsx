"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "../contexts/AuthContext"

// Define the structure of a diet event document.
interface DietEvent {
  id: string
  foodType: string
  brandName: string
  quantity: number
  eventDate: any  // Firestore Timestamp
  dogId: any      // DocumentReference to the dog's document
  dogName?: string  // Will be attached after fetching the dog's document
}

// Helper function to format Firestore Timestamps.
function formatTimestamp(timestamp: any): string {
  if (timestamp && typeof timestamp === "object" && "seconds" in timestamp) {
    const date = new Date(timestamp.seconds * 1000)
    return date.toLocaleString()
  }
  return String(timestamp)
}

export default function DietEventsPage() {
  const { user } = useAuth()
  const [dietEvents, setDietEvents] = useState<DietEvent[]>([])

  const fetchDietEvents = useCallback(async () => {
    if (!user) return
    try {
      // Create a DocumentReference for the current user.
      const userRef = doc(db, "users", user.uid)
      // Query dietEvents where userId equals the current user's DocumentReference,
      // ordered by eventDate descending.
      const dietEventsQuery = query(
        collection(db, "dietEvents"),
        where("userId", "==", userRef),
        orderBy("eventDate", "desc")
      )
      const querySnapshot = await getDocs(dietEventsQuery)
      const events = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as DietEvent[]

      // For each event, fetch the dog's name from the dogId reference.
      const eventsWithDogNames = await Promise.all(
        events.map(async (event) => {
          if (event.dogId) {
            try {
              const dogDoc = await getDoc(event.dogId)
              if (dogDoc.exists()) {
                const dogData = dogDoc.data()as { name?: string }
                return { ...event, dogName: dogData?.name || "Unknown" }
              }
            } catch (error) {
              console.error("Error fetching dog for event", event.id, error)
            }
          }
          return { ...event, dogName: "Unknown" }
        })
      )
      setDietEvents(eventsWithDogNames)
    } catch (error) {
      console.error("Error fetching diet events:", error)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchDietEvents()
    }
  }, [user, fetchDietEvents])

  return (
    <div className="min-h-screen bg-white flex flex-col p-4">
      <h1 className="text-4xl font-bold mb-4">Diet Events</h1>
      {dietEvents.map((event) => (
        <div key={event.id} className="border p-2 mb-2">
          <p><strong>Dog Name:</strong> {event.dogName}</p>
          <p><strong>Event Date:</strong> {formatTimestamp(event.eventDate)}</p>
          <p><strong>Food Type:</strong> {event.foodType}</p>
          <p><strong>Brand Name:</strong> {event.brandName}</p>
          <p><strong>Quantity:</strong> {event.quantity}</p>
        </div>
      ))}
      <Link href="/" className="mt-4 text-blue-600 hover:underline">
        Back to Home
      </Link>
    </div>
  )
}
