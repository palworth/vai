import { NextResponse } from "next/server"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const docRef = doc(db, "exerciseEvents", params.id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return NextResponse.json(docSnap.data())
    } else {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }
  } catch (_error) {
    console.error("Error fetching exercise event:", _error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const docRef = doc(db, "exerciseEvents", params.id)
    await updateDoc(docRef, body)
    return NextResponse.json({ message: "Event updated successfully" })
  } catch (_error) {
    console.error("Error updating exercise event:", _error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const docRef = doc(db, "exerciseEvents", params.id)
    await deleteDoc(docRef)
    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (_error) {
    console.error("Error deleting exercise event:", _error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

