import { type NextRequest, NextResponse } from "next/server"
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

/**
 * POST: Creates a new Exercise Event
 * GET: Lists events for a given dogId
 * DELETE: Deletes an event by id (from query param)
 */

// POST /api/exercise
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Validate required fields
    const requiredFields = ["userId", "dogId", "activityType", "eventDate"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
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

    // duration & distance are optional; if they exist, ensure they're valid numbers
    let durationVal = 0
    if (typeof data.duration === "number" && data.duration > 0) {
      durationVal = data.duration
    }
    let distanceVal = 0
    if (typeof data.distance === "number" && data.distance >= 0) {
      distanceVal = data.distance
    }

    const now = serverTimestamp()
    const exerciseEventData = {
      userId: doc(db, "users", data.userId),
      dogId: doc(db, "dogs", data.dogId),
      createdAt: now,
      updatedAt: now,
      type: "exercise",
      activityType: data.activityType,
      duration: durationVal,
      distance: distanceVal,
      source: data.source || "Manual Add",
      eventDate: Timestamp.fromDate(new Date(data.eventDate)), // convert string -> Timestamp
    }

    // Create the doc
    const docRef = await addDoc(collection(db, "exerciseEvents"), exerciseEventData)

    // Also add this event to dog's exerciseEventIds
    await updateDoc(doc(db, "dogs", data.dogId), {
      exerciseEventIds: arrayUnion(docRef),
    })

    // Return the created event
    const newExerciseEvent = {
      id: docRef.id,
      ...exerciseEventData,
      // Convert references back to strings for the response
      userId: data.userId,
      dogId: data.dogId,
      // Keep the original eventDate string for convenience
      eventDate: data.eventDate,
    }

    return NextResponse.json(newExerciseEvent)
  } catch (error) {
    console.error("Error creating exercise event:", error)
    return NextResponse.json({ error: "Failed to create exercise event" }, { status: 500 })
  }
}

// GET /api/exercise?dogId=XXXX
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dogId = searchParams.get("dogId")

  if (!dogId) {
    return NextResponse.json({ error: "dogId is required" }, { status: 400 })
  }

  try {
    const dogRef = doc(db, "dogs", dogId)
    const exerciseEventsQuery = query(collection(db, "exerciseEvents"), where("dogId", "==", dogRef))
    const querySnapshot = await getDocs(exerciseEventsQuery)

    const events = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        userId: data.userId?.id,
        dogId: data.dogId?.id,
        eventDate:
          data.eventDate instanceof Timestamp ? data.eventDate.toDate().toISOString() : null,
        createdAt:
          data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null,
        updatedAt:
          data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : null,
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching exercise events:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE /api/exercise?id=XXXX
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  try {
    const docRef = doc(db, "exerciseEvents", id)
    await deleteDoc(docRef)
    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting exercise event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
