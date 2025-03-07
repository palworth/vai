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

    // Create a DocumentReference for the user.
    const userRef = doc(db, "users", userId);

    // Query wellnessEvents where userId equals the userRef, ordered by eventDate descending.
    const wellnessEventsQuery = query(
      collection(db, "wellnessEvents"),
      where("userId", "==", userRef),
      orderBy("eventDate", "desc")
    );
    const querySnapshot = await getDocs(wellnessEventsQuery);

    // Map the query results.
    const events = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    // Transform each event to include desired fields and the id.
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
          id: event.id,
          dogName,
          eventDate: formatTimestamp(event.eventDate),
          mentalState: event.mentalState,
          severity: event.severity,
          notes: event.notes,
        };
      })
    );

    return NextResponse.json({ wellnessEvents: transformedEvents });
  } catch (error) {
    console.error("Error fetching wellness events:", error);
    return NextResponse.json(
      { error: "Error fetching wellness events" },
      { status: 500 }
    );
  }
}
