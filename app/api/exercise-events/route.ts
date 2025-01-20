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
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Validate required fields
    const requiredFields = ["userId", "dogId", "activityType", "duration", "distance", "eventDate"]
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

    // Validate duration and distance
    if (typeof data.duration !== "number" || data.duration <= 0) {
      return NextResponse.json({ error: "Duration must be a positive number" }, { status: 400 })
    }
    if (typeof data.distance !== "number" || data.distance < 0) {
      return NextResponse.json({ error: "Distance must be a non-negative number" }, { status: 400 })
    }

    const now = Timestamp.now()

    const exerciseEventData = {
      userId: doc(db, "users", data.userId),
      dogId: doc(db, "dogs", data.dogId),
      createdAt: now,
      updatedAt: now,
      type: "exercise",
      activityType: data.activityType,
      duration: data.duration,
      distance: data.distance,
      source: data.source || "Manual Add",
      eventDate: Timestamp.fromDate(new Date(data.eventDate)),
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
      eventDate: data.eventDate,
    }

    return NextResponse.json(newExerciseEvent)
  } catch (error) {
    console.error("Error creating exercise event:", error)
    return NextResponse.json({ error: "Failed to create exercise event" }, { status: 500 })
  }
}

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

    const events = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        userId: data.userId.id,
        dogId: data.dogId.id,
        eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate().toISOString() : null,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : null,
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching exercise events:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

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

