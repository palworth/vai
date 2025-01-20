import { type NextRequest, NextResponse } from "next/server"
import { collection, addDoc, Timestamp, doc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Validate required fields
    const requiredFields = ["userId", "dogId", "eventType", "notes", "severity"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Validate severity
    if (typeof data.severity !== "number" || data.severity < 1 || data.severity > 10) {
      return NextResponse.json({ error: "Severity must be a number between 1 and 10" }, { status: 400 })
    }

    const now = Timestamp.now()

    const healthEventData = {
      userId: data.userId, // Now expecting a string
      dogId: data.dogId, // Now expecting a string
      createdAt: now,
      updatedAt: now,
      type: "health",
      eventType: data.eventType,
      notes: data.notes,
      severity: data.severity,
    }

    const docRef = await addDoc(collection(db, "healthEvents"), {
      ...healthEventData,
      userId: doc(db, "users", data.userId), // Create Firestore reference here
      dogId: doc(db, "dogs", data.dogId), // Create Firestore reference here
    })

    // Add the health event reference to the dog's healthEventIds array
    await updateDoc(doc(db, "dogs", data.dogId), {
      healthEventIds: arrayUnion(docRef),
    })

    const newHealthEvent = {
      id: docRef.id,
      ...healthEventData,
    }

    return NextResponse.json(newHealthEvent)
  } catch (error) {
    console.error("Error creating health event:", error)
    return NextResponse.json({ error: "Failed to create health event" }, { status: 500 })
  }
}

