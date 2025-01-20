import { type NextRequest, NextResponse } from "next/server"
import { collection, addDoc, Timestamp, doc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Validate required fields
    const requiredFields = ["userId", "dogId", "mentalState", "severity"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Validate mentalState
    const validMentalStates = ["depressed", "anxious", "lethargic", "happy", "loving", "nervous"]
    if (!validMentalStates.includes(data.mentalState)) {
      return NextResponse.json({ error: "Invalid mental state" }, { status: 400 })
    }

    // Validate severity
    if (typeof data.severity !== "number" || data.severity < 1 || data.severity > 10) {
      return NextResponse.json({ error: "Severity must be a number between 1 and 10" }, { status: 400 })
    }

    const now = Timestamp.now()

    const wellnessEventData = {
      userId: doc(db, "users", data.userId),
      dogId: doc(db, "dogs", data.dogId),
      createdAt: now,
      updatedAt: now,
      type: "wellness",
      mentalState: data.mentalState,
      severity: data.severity,
    }

    const docRef = await addDoc(collection(db, "wellnessEvents"), wellnessEventData)

    // Add the wellness event reference to the dog's wellnessEvents array
    await updateDoc(doc(db, "dogs", data.dogId), {
      wellnessEvents: arrayUnion(docRef),
    })

    const newWellnessEvent = {
      id: docRef.id,
      ...wellnessEventData,
      userId: data.userId,
      dogId: data.dogId,
    }

    return NextResponse.json(newWellnessEvent)
  } catch (error) {
    console.error("Error creating wellness event:", error)
    return NextResponse.json({ error: "Failed to create wellness event" }, { status: 500 })
  }
}

