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
    const docRef = doc(db, "exerciseEvents", id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const data = docSnap.data()
    return NextResponse.json({
      id: docSnap.id,
      ...data,
      dogId: data.dogId?.id || data.dogId,
      userId: data.userId?.id || data.userId,
      eventDate: data.eventDate?.toDate?.()?.toISOString() || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
    })
  } catch (error) {
    console.error("Error fetching exercise event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const docRef = doc(db, "exerciseEvents", id)

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const { activityType, duration, distance, source, eventDate } = body
    const updateData: Record<string, any> = {
      activityType,
      duration: Number(duration) || 0,
      distance: Number(distance) || 0,
      source,
      updatedAt: serverTimestamp(),
    }

    if (eventDate) {
      updateData.eventDate = Timestamp.fromDate(new Date(eventDate))
    }

    await updateDoc(docRef, updateData)
    return NextResponse.json({ message: "Event updated successfully" })
  } catch (error) {
    console.error("Error updating exercise event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const docRef = doc(db, "exerciseEvents", id)
    await deleteDoc(docRef)
    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting exercise event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
