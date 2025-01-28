import { NextResponse } from "next/server"
import { collection, query, where, getDocs, doc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dogId = searchParams.get("dogId")

  if (!dogId) {
    return NextResponse.json({ error: "dogId is required" }, { status: 400 })
  }

  try {
    const dogRef = doc(db, "dogs", dogId)
    const dietEventsQuery = query(collection(db, "dietEvents"), where("dogId", "==", dogRef))
    const querySnapshot = await getDocs(dietEventsQuery)

    const dietData = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate().toISOString() : null,
        foodType: data.foodType,
        quantity: data.quantity,
      }
    })

    // Sort the data by date
    dietData.sort((a, b) => {
      if (!a.eventDate) return 1  // null dates go to end
      if (!b.eventDate) return -1
      return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    })

    // Group data by food type
    const groupedData = dietData.reduce((acc: { [key: string]: typeof dietData }, event) => {
      if (!acc[event.foodType]) {
        acc[event.foodType] = []
      }
      acc[event.foodType].push(event)
      return acc
    }, {})

    return NextResponse.json(groupedData)
  } catch (error) {
    console.error("Error fetching diet dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch diet dashboard data" }, { status: 500 })
  }
}

