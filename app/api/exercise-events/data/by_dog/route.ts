import { NextResponse } from "next/server";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
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
    const dogId = searchParams.get("dogId");

    if (!dogId) {
      return NextResponse.json(
        { error: "Missing dogId parameter" },
        { status: 400 }
      );
    }

    // Create a DocumentReference for the dog.
    const dogRef = doc(db, "dogs", dogId);

    // Query exerciseEvents where dogId equals the given dogRef, ordered by eventDate descending.
    const exerciseEventsQuery = query(
      collection(db, "exerciseEvents"),
      where("dogId", "==", dogRef),
      orderBy("eventDate", "desc")
    );
    const querySnapshot = await getDocs(exerciseEventsQuery);
    const events = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    // Transform each event to include the desired fields (and include id)
    const transformedEvents = events.map((event: any) => ({
      id: event.id,
      eventDate: formatTimestamp(event.eventDate),
      activityType: event.activityType,
      source: event.source,
      distance: event.distance,
      duration: event.duration,
    }));

    return NextResponse.json({ exerciseEvents: transformedEvents });
  } catch (error) {
    console.error("Error fetching exercise events by dog:", error);
    return NextResponse.json(
      { error: "Error fetching exercise events by dog" },
      { status: 500 }
    );
  }
}
