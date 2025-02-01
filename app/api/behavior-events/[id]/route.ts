//comment
import { NextResponse } from "next/server"
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const docRef = doc(db, "behaviorEvents", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return NextResponse.json({
        id: docSnap.id,
        ...data,
        dogId: data.dogId?.id || data.dogId, // Convert dogId reference to ID string
        userId: data.userId?.id || data.userId, // Also convert userId for consistency
        eventDate: data.eventDate?.toDate?.()?.toISOString() || data.eventDate || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      })
    } else {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error fetching behavior event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const docRef = doc(db, "behaviorEvents", id)

    // Extract only the fields we want to update
    const { behaviorType, severity, notes, eventDate } = body

    const updateData = {
      behaviorType,
      severity,
      notes,
      eventDate: eventDate ? Timestamp.fromDate(new Date(eventDate)) : null,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(docRef, updateData)
    return NextResponse.json({ message: "Event updated successfully" })
  } catch (error) {
    console.error("Error updating behavior event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const docRef = doc(db, "behaviorEvents", id)
    await deleteDoc(docRef)
    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting behavior event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

