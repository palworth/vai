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

// Define the structure of a health event document.
interface HealthEvent {
  id: string
  eventType: string
  notes: string
  severity: number
  eventDate: any  // Firestore Timestamp
  dogId: any      // DocumentReference to the dog's document
  dogName?: string  // Will be attached after fetching the dog's name
}

// Helper function to format Firestore Timestamps.
function formatTimestamp(timestamp: any): string {
  if (timestamp && typeof timestamp === "object" && "seconds" in timestamp) {
    const date = new Date(timestamp.seconds * 1000)
    return date.toLocaleString()
  }
  return String(timestamp)
}

export default function HealthEventsPage() {
  const { user } = useAuth()
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([])

  const fetchHealthEvents = useCallback(async () => {
    if (!user) return
    try {
      // Create a DocumentReference for the current user.
      const userRef = doc(db, "users", user.uid)
      // Query healthEvents where userId equals the current user's DocumentReference,
      // and order them by eventDate descending.
      const healthEventsQuery = query(
        collection(db, "healthEvents"),
        where("userId", "==", userRef),
        orderBy("eventDate", "desc")
      )
      const querySnapshot = await getDocs(healthEventsQuery)
      const events = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as HealthEvent[]

      // For each event, fetch the dog's name from the dogId reference.
      const eventsWithDogNames = await Promise.all(
        events.map(async (event) => {
          if (event.dogId) {
            try {
              const dogDoc = await getDoc(event.dogId)
              if (dogDoc.exists()) {
                const dogData = dogDoc.data() as { name?: string }
                return { ...event, dogName: dogData?.name || "Unknown" }
              }
            } catch (error) {
              console.error("Error fetching dog for event", event.id, error)
            }
          }
          return { ...event, dogName: "Unknown" }
        })
      )
      setHealthEvents(eventsWithDogNames)
    } catch (error) {
      console.error("Error fetching health events:", error)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchHealthEvents()
    }
  }, [user, fetchHealthEvents])

  return (
    <div className="min-h-screen bg-white flex flex-col p-4">
      <h1 className="text-4xl font-bold mb-4">Health Events</h1>
      {healthEvents.map((event) => (
        <div key={event.id} className="border p-2 mb-2">
          <p><strong>Dog Name:</strong> {event.dogName}</p>
          <p><strong>Event Date:</strong> {formatTimestamp(event.eventDate)}</p>
          <p><strong>Event Type:</strong> {event.eventType}</p>
          <p><strong>Severity:</strong> {event.severity}</p>
          <p><strong>Notes:</strong> {event.notes}</p>
        </div>
      ))}
      <Link href="/" className="mt-4 text-blue-600 hover:underline">
        Back to Home
      </Link>
    </div>
  )
}
