import { NextResponse } from "next/server"
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
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
        eventDate: data.eventDate?.toDate().toISOString(),
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
    const { behaviorType, severity, notes } = body

    const updateData = {
      behaviorType,
      severity,
      notes,
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

