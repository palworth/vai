// this is the openAi chat route
import OpenAI from "openai"
import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"

interface Event {
  type: string
  description: string
  createdAt: Date
}

type EventData = {
  eventType?: string
  severity?: number
  foodType?: string
  quantity?: number
  activityType?: string
  duration?: number
  mentalState?: string
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
  }

  try {
    const { messages, dogId, isGeneralChat } = await req.json()

    // If we might need userId in the future, use this instead:
    // const { messages, dogId, /* userId, */ isGeneralChat } = await req.json()

    let context = ""

    if (!isGeneralChat && dogId) {
      // Fetch dog information
      const dogDoc = await getDoc(doc(db, "dogs", dogId))
      if (!dogDoc.exists()) {
        return NextResponse.json({ error: "Dog not found" }, { status: 404 })
      }
      const dogData = dogDoc.data()

      // Fetch recent events
      const recentEvents = await fetchRecentEvents(dogId)

      // Construct a context string with dog and event information
      context = `
        Dog Information:
        Name: ${dogData.name}
        Breed: ${dogData.breed}
        Age: ${dogData.age}
        Weight: ${dogData.weight} lbs

        Recent Events:
        ${recentEvents.map((event) => `- ${event.type}: ${event.description}`).join("\n")}
      `
    }

    const systemMessage = isGeneralChat
      ? "You are VETai, an AI assistant specialized in veterinary medicine. Provide helpful and accurate information about animal health, but always advise users to consult with a professional veterinarian for specific medical advice or emergencies."
      : `You are VETai, an AI assistant specialized in veterinary medicine. Provide helpful and accurate information about animal health, but always advise users to consult with a professional veterinarian for specific medical advice or emergencies. Use the following context about the dog and recent events to provide more specific and relevant advice:\n\n${context}`

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        ...messages,
      ],
    })

    const aiMessage = response.choices[0].message

    return NextResponse.json({
      content: aiMessage.content,
    })
  } catch (error) {
    console.error("Error in API route:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 })
  }
}

async function fetchRecentEvents(dogId: string): Promise<Event[]> {
  const eventTypes = ["healthEvents", "behaviorEvents", "dietEvents", "exerciseEvents", "wellnessEvents"]
  let allEvents: Event[] = []

  for (const eventType of eventTypes) {
    try {
      const eventQuery = query(
        collection(db, eventType),
        where("dogId", "==", doc(db, "dogs", dogId)),
        where("createdAt", ">=", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // Last 30 days
      )

      const eventSnapshot = await getDocs(eventQuery)
      const events = eventSnapshot.docs.map((doc) => ({
        type: eventType.slice(0, -6), // Remove 'Events' from the end
        description: getEventDescription(doc.data(), eventType),
        createdAt: doc.data().createdAt.toDate(),
      }))

      allEvents = allEvents.concat(events)
    } catch (error) {
      console.error(`Error fetching ${eventType}:`, error)
      // If it's an indexing error, log a more specific message
      if (error instanceof Error && error.message.includes("The query requires an index")) {
        console.error(`An index is required for ${eventType}. Please create the index in the Firebase console.`)
      }
      // Continue with the next event type
      continue
    }
  }

  // Sort events by date and take the 5 most recent
  return allEvents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5)
}

function getEventDescription(event: EventData, eventType: string): string {
  switch (eventType) {
    case "healthEvents":
      return `Health event: ${event.eventType}, Severity: ${event.severity}`
    case "behaviorEvents":
      return `Behavior: ${event.eventType}, Severity: ${event.severity}`
    case "dietEvents":
      return `Diet: ${event.foodType}, Quantity: ${event.quantity}g`
    case "exerciseEvents":
      return `Exercise: ${event.activityType}, Duration: ${event.duration} minutes`
    case "wellnessEvents":
      return `Wellness: Mental state - ${event.mentalState}, Severity: ${event.severity}`
    default:
      return "Unknown event type"
  }
}

