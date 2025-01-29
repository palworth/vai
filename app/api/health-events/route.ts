import { NextResponse } from "next/server"
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

/**
 * GET: Query healthEvents by dogId
 * POST: Create a new health event
 * PUT: Update a health event
 * DELETE: Delete a health event
 */

// GET /api/Health?dogId=XXX
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dogId = searchParams.get("dogId")

  if (!dogId) {
    return NextResponse.json({ error: "dogId is required" }, { status: 400 })
  }

  try {
    const dogRef = doc(db, "dogs", dogId)
    const healthEventsQuery = query(collection(db, "healthEvents"), where("dogId", "==", dogRef))
    const querySnapshot = await getDocs(healthEventsQuery)

    const events = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        // Convert references to string IDs
        dogId: data.dogId?.id,
        userId: data.userId?.id,
        // Convert Firestore Timestamps to ISO strings
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        eventDate: data.eventDate?.toDate?.()?.toISOString() || null,
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching health events:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/Health
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const dogRef = doc(db, "dogs", body.dogId)
    const userRef = doc(db, "users", body.userId)
    const now = serverTimestamp()

    const eventData = {
      ...body,
      dogId: dogRef,
      userId: userRef,
      createdAt: now,
      updatedAt: now,
      // If body.eventDate is provided as a string, convert to Timestamp, else fallback to now
      eventDate: body.eventDate
        ? Timestamp.fromDate(new Date(body.eventDate))
        : now,
    }

    const docRef = await addDoc(collection(db, "healthEvents"), eventData)
    return NextResponse.json({
      id: docRef.id,
      ...body,
      createdAt: now,
      updatedAt: now,
      eventDate: eventData.eventDate,
    })
  } catch (error) {
    console.error("Error creating health event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PUT /api/Health
export async function PUT(request: Request) {
  try {
    // Expect { id, dogId, userId, eventType, notes, severity, eventDate, ... } in the body
    const { id, ...updateData } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const docRef = doc(db, "healthEvents", id)

    // Convert dogId / userId to references, if provided
    if (updateData.dogId) {
      updateData.dogId = doc(db, "dogs", updateData.dogId)
    }
    if (updateData.userId) {
      updateData.userId = doc(db, "users", updateData.userId)
    }

    // Always update updatedAt
    updateData.updatedAt = serverTimestamp()

    // Convert eventDate if provided
    if (updateData.eventDate) {
      updateData.eventDate = Timestamp.fromDate(new Date(updateData.eventDate))
    }

    await updateDoc(docRef, updateData)
    return NextResponse.json({ message: "Event updated successfully" })
  } catch (error) {
    console.error("Error updating health event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE /api/Health?id=XYZ
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  try {
    const docRef = doc(db, "healthEvents", id)
    await deleteDoc(docRef)
    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting health event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
