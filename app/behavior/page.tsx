"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { collection, getDocs, query, where, orderBy, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "../contexts/AuthContext"

// Define the structure of a behavior event document.
interface BehaviorEvent {
  id: string
  behaviorType: string
  notes: string
  severity: number
  eventDate: any  // Firestore Timestamp
  dogId: any      // DocumentReference to the dog's document
  dogName?: string  // We'll attach this after fetching
}

// Helper function to format Firestore Timestamp objects.
function formatTimestamp(timestamp: any): string {
  if (timestamp && typeof timestamp === "object" && "seconds" in timestamp) {
    const date = new Date(timestamp.seconds * 1000)
    return date.toLocaleString()
  }
  return String(timestamp)
}

export default function BehaviorPage() {
  const { user } = useAuth()
  const [behaviorEvents, setBehaviorEvents] = useState<BehaviorEvent[]>([])

  const fetchBehaviorEvents = useCallback(async () => {
    if (!user) return
    try {
      // Create a DocumentReference for the current user.
      const userRef = doc(db, "users", user.uid)
      // Query behaviorEvents where userId equals the current user's DocumentReference.
      const behaviorEventsQuery = query(
        collection(db, "behaviorEvents"),
        where("userId", "==", userRef),
        orderBy("eventDate", "desc")
      )
      const querySnapshot = await getDocs(behaviorEventsQuery)
      // Map the query snapshot to our events array.
      const events = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as BehaviorEvent[]

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
      setBehaviorEvents(eventsWithDogNames)
    } catch (error) {
      console.error("Error fetching behavior events:", error)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchBehaviorEvents()
    }
  }, [user, fetchBehaviorEvents])

  return (
    <div className="min-h-screen bg-white flex flex-col p-4">
      <h1 className="text-4xl font-bold mb-4">Behavior</h1>
      {behaviorEvents.map((event) => (
        <div key={event.id} className="border p-2 mb-2">
          <p><strong>Dog:</strong> {event.dogName}</p>
          <p><strong>Type:</strong> {event.behaviorType}</p>
          <p><strong>Notes:</strong> {event.notes}</p>
          <p><strong>Severity:</strong> {event.severity}</p>
          <p><strong>Date:</strong> {formatTimestamp(event.eventDate)}</p>
        </div>
      ))}
      <Link href="/" className="mt-4 text-blue-600 hover:underline">
        Back to Home
      </Link>
    </div>
  )
}
