import { NextResponse } from "next/server"
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const docRef = doc(db, "dietEvents", id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const data = docSnap.data()
    // Convert Firestore references and Timestamps into usable strings
    return NextResponse.json({
      id: docSnap.id,
      ...data,
      dogId: data.dogId?.id || data.dogId,
      userId: data.userId?.id || data.userId,
      eventDate: data.eventDate?.toDate?.()?.toISOString() || data.eventDate || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
    })
  } catch (error) {
    console.error("Error fetching diet event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const docRef = doc(db, "dietEvents", id)

    // Pull out only the fields we want to allow updates for
    const { foodType, brandName, quantity, eventDate } = body

    // Build an object of fields to update
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const updateData: Record<string, any> = {
      foodType,
      brandName,
      quantity: Number(quantity) || 0, // ensure numeric
      updatedAt: serverTimestamp(),
    }

    // Convert eventDate string to Firestore Timestamp (if provided)
    if (eventDate) {
      updateData.eventDate = Timestamp.fromDate(new Date(eventDate))
    }

    await updateDoc(docRef, updateData)
    return NextResponse.json({ message: "Event updated successfully" })
  } catch (error) {
    console.error("Error updating diet event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const docRef = doc(db, "dietEvents", id)
    await deleteDoc(docRef)
    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting diet event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
