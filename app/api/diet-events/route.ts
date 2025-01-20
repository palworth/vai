import { type NextRequest, NextResponse } from "next/server"
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Validate required fields
    const requiredFields = ["userId", "dogId", "foodType", "quantity", "eventDate"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Validate foodType
    const validFoodTypes = ["dry kibble", "homemade", "raw", "custom", "wet"]
    if (!validFoodTypes.includes(data.foodType)) {
      return NextResponse.json({ error: "Invalid food type" }, { status: 400 })
    }

    // Validate quantity
    if (typeof data.quantity !== "number" || data.quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be a positive number" }, { status: 400 })
    }

    const now = Timestamp.now()

    const dietEventData = {
      userId: doc(db, "users", data.userId),
      dogId: doc(db, "dogs", data.dogId),
      createdAt: now,
      updatedAt: now,
      type: "diet",
      foodType: data.foodType,
      brandName: data.brandName || "",
      quantity: data.quantity,
      eventDate: Timestamp.fromDate(new Date(data.eventDate)),
    }

    const docRef = await addDoc(collection(db, "dietEvents"), dietEventData)

    // Add the diet event reference to the dog's dietEventIds array
    await updateDoc(doc(db, "dogs", data.dogId), {
      dietEventIds: arrayUnion(docRef),
    })

    const newDietEvent = {
      id: docRef.id,
      ...dietEventData,
      userId: data.userId,
      dogId: data.dogId,
      eventDate: data.eventDate,
    }

    return NextResponse.json(newDietEvent)
  } catch (error) {
    console.error("Error creating diet event:", error)
    return NextResponse.json({ error: "Failed to create diet event" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dogId = searchParams.get("dogId")

  if (!dogId) {
    return NextResponse.json({ error: "dogId is required" }, { status: 400 })
  }

  try {
    const dogRef = doc(db, "dogs", dogId)
    const dietEventsQuery = query(collection(db, "dietEvents"), where("dogId", "==", dogRef))
    const querySnapshot = await getDocs(dietEventsQuery)

    const events = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        userId: data.userId.id,
        dogId: data.dogId.id,
        eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate().toISOString() : null,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : null,
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching diet events:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  try {
    const docRef = doc(db, "dietEvents", id)
    await deleteDoc(docRef)
    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting diet event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

