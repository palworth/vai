import { type NextRequest, NextResponse } from "next/server"
import { collection, addDoc, Timestamp, doc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Validate required fields
    const requiredFields = ["userId", "dogId", "duration", "distance", "source", "activityType"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Validate source
    const validSources = ["Manual Add", "Strava", "Whoop", "Fitbit", "Garmin", "Apple Health"]
    if (!validSources.includes(data.source)) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 })
    }

    // Validate activityType
    const validActivityTypes = [
      "Walking",
      "Running/Jogging",
      "Fetch",
      "Hiking",
      "Dog Park Playtime",
      "Indoor Play",
      "Outside Alone Time",
      "Swimming",
    ]
    if (!validActivityTypes.includes(data.activityType)) {
      return NextResponse.json({ error: "Invalid activity type" }, { status: 400 })
    }

    const now = Timestamp.now()

    const exerciseEventData = {
      userId: doc(db, "users", data.userId),
      dogId: doc(db, "dogs", data.dogId),
      createdAt: now,
      updatedAt: now,
      type: "exercise",
      duration: data.duration,
      distance: data.distance,
      source: data.source,
      activityType: data.activityType,
    }

    const docRef = await addDoc(collection(db, "exerciseEvents"), exerciseEventData)

    // Add the exercise event reference to the dog's exerciseEventIds array
    await updateDoc(doc(db, "dogs", data.dogId), {
      exerciseEventIds: arrayUnion(docRef),
    })

    const newExerciseEvent = {
      id: docRef.id,
      ...exerciseEventData,
      userId: data.userId,
      dogId: data.dogId,
    }

    return NextResponse.json(newExerciseEvent)
  } catch (error) {
    console.error("Error creating exercise event:", error)
    return NextResponse.json({ error: "Failed to create exercise event" }, { status: 500 })
  }
}

