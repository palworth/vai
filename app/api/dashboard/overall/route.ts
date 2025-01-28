import { NextResponse } from "next/server"
import { collection, query, where, getDocs, doc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const dogId = searchParams.get("dogId")

  console.log("Received request for dashboard data:", { userId, dogId })

  if (!userId || !dogId) {
    console.error("Missing userId or dogId")
    return NextResponse.json({ error: "userId and dogId are required" }, { status: 400 })
  }

  try {
    const dogRef = doc(db, "dogs", dogId)

    // Fetch events for the specific dog
    const [healthEvents, exerciseEvents, dietEvents, wellnessEvents] = await Promise.all([
      getDocs(query(collection(db, "healthEvents"), where("dogId", "==", dogRef))),
      getDocs(query(collection(db, "exerciseEvents"), where("dogId", "==", dogRef))),
      getDocs(query(collection(db, "dietEvents"), where("dogId", "==", dogRef))),
      getDocs(query(collection(db, "wellnessEvents"), where("dogId", "==", dogRef))),
    ])

    console.log("Fetched event counts:", {
      health: healthEvents.docs.length,
      exercise: exerciseEvents.docs.length,
      diet: dietEvents.docs.length,
      wellness: wellnessEvents.docs.length,
    })

    // Process Health Score (average severity from healthEvents)
    const healthScores = healthEvents.docs.map((doc) => doc.data().severity)
    const totalHealthScore = healthScores.length ? healthScores.reduce((a, b) => a + b, 0) / healthScores.length : 0

    // Summarize data
    const activitySummary = exerciseEvents.docs.map((doc) => {
      const data = doc.data()
      return {
        ...data,
        eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate().toISOString() : null,
      }
    })
    const dietSummary = dietEvents.docs.map((doc) => {
      const data = doc.data()
      return {
        ...data,
        eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate().toISOString() : null,
      }
    })
    const wellnessSummary = wellnessEvents.docs.map((doc) => {
      const data = doc.data()
      return {
        ...data,
        eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate().toISOString() : null,
      }
    })

    const responseData = {
      totalHealthScore,
      activitySummary,
      dietSummary,
      wellnessSummary,
    }

    console.log("Sending dashboard data:", responseData)

    return NextResponse.json(responseData)
  } catch (error: unknown) {
    console.error("Error fetching dashboard data:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to fetch dashboard data", details: errorMessage }, { status: 500 })
  }
}

