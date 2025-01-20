import { NextResponse } from "next/server"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const docRef = doc(db, "wellnessEvents", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return NextResponse.json(docSnap.data())
    } else {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error fetching wellness event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const docRef = doc(db, "wellnessEvents", id)
    await updateDoc(docRef, body)
    return NextResponse.json({ message: "Event updated successfully" })
  } catch (error) {
    console.error("Error updating wellness event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const docRef = doc(db, "wellnessEvents", id)
    await deleteDoc(docRef)
    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting wellness event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

