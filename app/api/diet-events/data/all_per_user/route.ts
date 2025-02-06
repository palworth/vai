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

// Helper to format Firestore Timestamps to a readable string.
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

    // Query dietEvents where userId equals the user reference.
    const dietEventsQuery = query(
      collection(db, "dietEvents"),
      where("userId", "==", userRef),
      orderBy("eventDate", "desc")
    );
    const querySnapshot = await getDocs(dietEventsQuery);
    const events = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    // For each event, fetch the dog's name from the dogId reference and transform the output.
    const transformedEvents = await Promise.all(
      events.map(async (event: any) => {
        let dogName = "Unknown";
        if (event.dogId) {
          try {
            const dogDoc = await getDoc(event.dogId);
            if (dogDoc.exists()) {
              const dogData = dogDoc.data()as { name?: string };
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
          foodType: event.foodType,
          brandName: event.brandName,
          quantity: event.quantity,
        };
      })
    );

    return NextResponse.json({ dietEvents: transformedEvents });
  } catch (error) {
    console.error("Error fetching diet events:", error);
    return NextResponse.json(
      { error: "Error fetching diet events" },
      { status: 500 }
    );
  }
}
