import { type NextRequest, NextResponse } from "next/server"
import { collection, addDoc, Timestamp, doc, updateDoc, arrayUnion } from "firebase/firestore"
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

