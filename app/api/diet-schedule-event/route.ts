// app/api/diet-schedule-event/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate required fields
    const requiredFields = [
      "userId",
      "dogId",
      "scheduleName",
      "feedingTimes",
      "foodType",
      "quantity",
      "eventDate"
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Validate feedingTimes
    const allowedFeedingTimes = ["morning", "evening", "allDay"];
    if (!Array.isArray(data.feedingTimes) || data.feedingTimes.length === 0) {
      return NextResponse.json({ error: "feedingTimes must be a non-empty array" }, { status: 400 });
    }
    for (const time of data.feedingTimes) {
      if (!allowedFeedingTimes.includes(time)) {
        return NextResponse.json({ error: `Invalid feeding time: ${time}` }, { status: 400 });
      }
    }
    if (data.feedingTimes.includes("allDay") && data.feedingTimes.length > 1) {
      return NextResponse.json({ error: '"allDay" cannot be combined with other feeding times' }, { status: 400 });
    }

    // Validate quantity
    if (typeof data.quantity !== "number" || data.quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be a positive number" }, { status: 400 });
    }

    const now = Timestamp.now();

    const dietScheduleEventData = {
      userId: doc(db, "users", data.userId),
      dogId: doc(db, "dogs", data.dogId),
      scheduleName: data.scheduleName,
      feedingTimes: data.feedingTimes,
      foodType: data.foodType,
      brandName: data.brandName || "",
      quantity: data.quantity,
      eventDate: Timestamp.fromDate(new Date(data.eventDate)),
      createdAt: now,
      updatedAt: now,
      type: "diet-schedule",
    };

    const docRef = await addDoc(collection(db, "dietScheduleEvents"), dietScheduleEventData);

    // Optionally, add the reference to the dog's document.
    await updateDoc(doc(db, "dogs", data.dogId), {
      dietScheduleEventIds: arrayUnion(docRef)
    });

    const newDietScheduleEvent = {
      id: docRef.id,
      ...dietScheduleEventData,
      // Convert Firestore references back to plain IDs for the response.
      userId: data.userId,
      dogId: data.dogId,
      eventDate: data.eventDate,
    };

    return NextResponse.json(newDietScheduleEvent);
  } catch (error) {
    console.error("Error creating diet schedule event:", error);
    return NextResponse.json({ error: "Failed to create diet schedule event" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dogId = searchParams.get("dogId");

  if (!dogId) {
    return NextResponse.json({ error: "dogId is required" }, { status: 400 });
  }

  try {
    const dogRef = doc(db, "dogs", dogId);
    const scheduleEventsQuery = query(
      collection(db, "dietScheduleEvents"),
      where("dogId", "==", dogRef)
    );
    const querySnapshot = await getDocs(scheduleEventsQuery);

    const events = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        // Convert Firestore references to plain string IDs
        userId: data.userId.id,
        dogId: data.dogId.id,
        eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate().toISOString() : null,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : null,
      };
    });

    return NextResponse.json({ dietScheduleEvents: events });
  } catch (error) {
    console.error("Error fetching diet schedule events:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
