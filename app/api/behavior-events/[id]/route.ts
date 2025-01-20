import { type NextRequest, NextResponse } from "next/server"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  const eventRef = doc(db, "behaviorEvents", id)
  const eventSnap = await getDoc(eventRef)

  if (!eventSnap.exists()) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  return NextResponse.json({ id: eventSnap.id, ...eventSnap.data() })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  const data = await request.json()
  const eventRef = doc(db, "behaviorEvents", id)

  try {
    await updateDoc(eventRef, data)
    const updatedSnap = await getDoc(eventRef)
    return NextResponse.json({ id: updatedSnap.id, ...updatedSnap.data() })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  const eventRef = doc(db, "behaviorEvents", id)

  try {
    await deleteDoc(eventRef)
    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}

