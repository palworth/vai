import { type NextRequest, NextResponse } from "next/server"
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

// GET /api/dogs/[id] - Get a specific dog
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const dogDoc = await getDoc(doc(db, "dogs", id))
    if (!dogDoc.exists()) {
      return NextResponse.json({ error: "Dog not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: dogDoc.id,
      ...dogDoc.data(),
    })
  } catch (error) {
    console.error("Error fetching dog:", error)
    return NextResponse.json({ error: "Failed to fetch dog" }, { status: 500 })
  }
}

// PUT /api/dogs/[id] - Update a dog
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const data = await req.json()
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    }

    if (data.birthday) {
      updateData.birthday = Timestamp.fromDate(new Date(data.birthday))
    }

    await updateDoc(doc(db, "dogs", id), updateData)
    const updatedDoc = await getDoc(doc(db, "dogs", id))

    if (!updatedDoc.exists()) {
      return NextResponse.json({ error: "Dog not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    })
  } catch (error) {
    console.error("Error updating dog:", error)
    return NextResponse.json({ error: "Failed to update dog" }, { status: 500 })
  }
}

// DELETE /api/dogs/[id] - Delete a dog
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    await deleteDoc(doc(db, "dogs", id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting dog:", error)
    return NextResponse.json({ error: "Failed to delete dog" }, { status: 500 })
  }
}

