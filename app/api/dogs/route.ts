import { NextResponse } from "next/server"
import { collection, addDoc, getDocs, Timestamp, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

// GET /api/dogs - Get all dogs
export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, "dogs"))
    const dogs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return NextResponse.json(dogs)
  } catch (error) {
    console.error("Error fetching dogs:", error)
    return NextResponse.json({ error: "Failed to fetch dogs" }, { status: 500 })
  }
}

// POST /api/dogs - Create a new dog
export async function POST(req: Request) {
  try {
    const data = await req.json()

    // Validate required fields
    const requiredFields = ["name", "breed", "age", "sex", "weight", "userId"]
    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Additional validation for numeric fields
    if (typeof data.age !== "number" || isNaN(data.age) || data.age < 0) {
      return NextResponse.json({ error: "Age must be a non-negative number" }, { status: 400 })
    }
    if (typeof data.weight !== "number" || data.weight <= 0) {
      return NextResponse.json({ error: "Weight must be a positive number" }, { status: 400 })
    }

    const now = Timestamp.now()

    const dogData = {
      name: data.name,
      breed: data.breed,
      age: data.age,
      sex: data.sex,
      weight: data.weight,
      birthday: data.birthday ? Timestamp.fromDate(new Date(data.birthday)) : null,
      createdAt: now,
      updatedAt: now,
      users: [doc(db, "users", data.userId)], // Create a reference to the user
      behaviorEventIds: [],
      dietEventIds: [],
      exerciseEventIds: [],
      healthEventIds: [],
    }

    const docRef = await addDoc(collection(db, "dogs"), dogData)
    const newDog = {
      id: docRef.id,
      ...dogData,
    }

    return NextResponse.json(newDog)
  } catch (error) {
    console.error("Error creating dog:", error)
    return NextResponse.json({ error: "Failed to create dog" }, { status: 500 })
  }
}

