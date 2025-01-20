import { NextResponse } from "next/server"
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dogId = searchParams.get("dogId")

  if (!dogId) {
    return NextResponse.json({ error: "dogId is required" }, { status: 400 })
  }

  try {
    const dogRef = doc(db, "dogs", dogId)
    const behaviorEventsQuery = query(collection(db, "behaviorEvents"), where("dogId", "==", dogRef))
    const querySnapshot = await getDocs(behaviorEventsQuery)

    const events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dogId: doc.data().dogId.id,
      userId: doc.data().userId.id,
    }))

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching behavior events:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const dogRef = doc(db, "dogs", body.dogId)
    const userRef = doc(db, "users", body.userId)
    const eventData = {
      ...body,
      dogId: dogRef,
      userId: userRef,
    }
    const docRef = await addDoc(collection(db, "behaviorEvents"), eventData)
    return NextResponse.json({ id: docRef.id, ...body })
  } catch (error) {
    console.error("Error creating behavior event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updateData } = await request.json()
    const docRef = doc(db, "behaviorEvents", id)

    // Convert dogId and userId to references if they're being updated
    if (updateData.dogId) {
      updateData.dogId = doc(db, "dogs", updateData.dogId)
    }
    if (updateData.userId) {
      updateData.userId = doc(db, "users", updateData.userId)
    }

    await updateDoc(docRef, updateData)
    return NextResponse.json({ message: "Event updated successfully" })
  } catch (error) {
    console.error("Error updating behavior event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  try {
    const docRef = doc(db, "behaviorEvents", id)
    await deleteDoc(docRef)
    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting behavior event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

