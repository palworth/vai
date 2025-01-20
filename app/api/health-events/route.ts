import { NextResponse } from "next/server"
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

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

    const events = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate().toISOString() : null,
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching health events:", error)
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
      eventDate: Timestamp.fromDate(new Date(body.eventDate)),
    }
    const docRef = await addDoc(collection(db, "healthEvents"), eventData)
    return NextResponse.json({ id: docRef.id, ...eventData })
  } catch (error) {
    console.error("Error creating health event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updateData } = await request.json()
    const docRef = doc(db, "healthEvents", id)

    if (updateData.dogId) {
      updateData.dogId = doc(db, "dogs", updateData.dogId)
    }
    if (updateData.userId) {
      updateData.userId = doc(db, "users", updateData.userId)
    }
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

