import { NextResponse } from "next/server";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Helper function to format Firestore Timestamps.
function formatTimestamp(timestamp: any): string {
  if (timestamp && typeof timestamp === "object" && "seconds" in timestamp) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  }
  return String(timestamp);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const userRef = doc(db, "users", userId);
    const healthEventsQuery = query(
      collection(db, "healthEvents"),
      where("userId", "==", userRef),
      orderBy("eventDate", "desc")
    );
    const querySnapshot = await getDocs(healthEventsQuery);
    const events = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    const transformedEvents = await Promise.all(
      events.map(async (event: any) => {
        let dogName = "Unknown";
        if (event.dogId) {
          try {
            const dogDoc = await getDoc(event.dogId);
            if (dogDoc.exists()) {
              const dogData = dogDoc.data() as { name?: string };
              dogName = dogData?.name || "Unknown";
            }
          } catch (error) {
            console.error("Error fetching dog for event", event.id, error);
          }
        }
        return {
          id: event.id,  // Include the id
          dogName,
          eventDate: formatTimestamp(event.eventDate),
          eventType: event.eventType,
          severity: event.severity,
          notes: event.notes,
        };
      })
    );

    return NextResponse.json({ healthEvents: transformedEvents });
  } catch (error) {
    console.error("Error fetching health events:", error);
    return NextResponse.json(
      { error: "Error fetching health events" },
      { status: 500 }
    );
  }
}
