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

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Required fields
    const requiredFields = ["userId", "dogId", "mentalState", "severity", "eventDate"]
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

    const now = serverTimestamp()

    const wellnessEventData = {
      userId: doc(db, "users", data.userId),
      dogId: doc(db, "dogs", data.dogId),
      createdAt: now,
      updatedAt: now,
      type: "wellness",
      mentalState: data.mentalState,
      severity: data.severity,
      // notes is optional
      notes: data.notes || "",
      eventDate: Timestamp.fromDate(new Date(data.eventDate)),
    }

    // Create doc
    const docRef = await addDoc(collection(db, "wellnessEvents"), wellnessEventData)

    // Add to dog's wellnessEventIds array
    await updateDoc(doc(db, "dogs", data.dogId), {
      wellnessEventIds: arrayUnion(docRef),
    })

    const newWellnessEvent = {
      id: docRef.id,
      ...wellnessEventData,
      // Convert references back
      userId: data.userId,
      dogId: data.dogId,
      eventDate: data.eventDate,
    }

    return NextResponse.json(newWellnessEvent)
  } catch (error) {
    console.error("Error creating wellness event:", error)
    return NextResponse.json({ error: "Failed to create wellness event" }, { status: 500 })
  }
}

// GET /api/wellness?dogId=XXXX
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dogId = searchParams.get("dogId")

  if (!dogId) {
    return NextResponse.json({ error: "dogId is required" }, { status: 400 })
  }

  try {
    const dogRef = doc(db, "dogs", dogId)
    const wellnessEventsQuery = query(collection(db, "wellnessEvents"), where("dogId", "==", dogRef))
    const querySnapshot = await getDocs(wellnessEventsQuery)

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
    console.error("Error fetching wellness events:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE /api/wellness?id=XXXX
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  try {
    const docRef = doc(db, "wellnessEvents", id)
    await deleteDoc(docRef)
    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting wellness event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
