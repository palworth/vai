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

    // Validate eventType
    const validEventTypes = ["Barking", "Chewing", "Digging", "Jumping", "Whining", "Aggression", "Fear"]
    if (!validEventTypes.includes(data.eventType)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 })
    }

    const now = Timestamp.now()

    const behaviorEventData = {
      userId: data.userId,
      dogId: data.dogId,
      createdAt: now,
      updatedAt: now,
      type: "behavior",
      eventType: data.eventType,
      notes: data.notes,
      severity: data.severity,
    }

    const docRef = await addDoc(collection(db, "behaviorEvents"), {
      ...behaviorEventData,
      userId: doc(db, "users", data.userId),
      dogId: doc(db, "dogs", data.dogId),
    })

    // Add the behavior event reference to the dog's behaviorEventIds array
    await updateDoc(doc(db, "dogs", data.dogId), {
      behaviorEventIds: arrayUnion(docRef),
    })

    const newBehaviorEvent = {
      id: docRef.id,
      ...behaviorEventData,
    }

    return NextResponse.json(newBehaviorEvent)
  } catch (error) {
    console.error("Error creating behavior event:", error)
    return NextResponse.json({ error: "Failed to create behavior event" }, { status: 500 })
  }
}

