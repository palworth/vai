// app/api/diet-schedule-event/[id]/route.ts

import { NextResponse } from "next/server";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(request: Request, context: any) {
  try {
    const { id } = context.params;
    const docRef = doc(db, "dietScheduleEvents", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "Schedule event not found" }, { status: 404 });
    }

    const data = docSnap.data();
    return NextResponse.json({
      id: docSnap.id,
      type: "diet-schedule",
      ...data,
      dogId: data.dogId?.id || data.dogId,
      userId: data.userId?.id || data.userId,
      eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate().toISOString() : data.eventDate,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : null,
    });
  } catch (error) {
    console.error("Error fetching diet schedule event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: any) {
  try {
    const { id } = context.params;
    const body = await request.json();
    const docRef = doc(db, "dietScheduleEvents", id);

    // Validate feedingTimes if provided
    const allowedFeedingTimes = ["morning", "evening", "allDay"];
    if (body.feedingTimes) {
      if (!Array.isArray(body.feedingTimes) || body.feedingTimes.length === 0) {
        return NextResponse.json({ error: "feedingTimes must be a non-empty array" }, { status: 400 });
      }
      for (const time of body.feedingTimes) {
        if (!allowedFeedingTimes.includes(time)) {
          return NextResponse.json({ error: `Invalid feeding time: ${time}` }, { status: 400 });
        }
      }
      if (body.feedingTimes.includes("allDay") && body.feedingTimes.length > 1) {
        return NextResponse.json({ error: '"allDay" cannot be combined with other feeding times' }, { status: 400 });
      }
    }

    // Extract fields to update.
    const { scheduleName, feedingTimes, foodType, brandName, quantity, eventDate } = body;
    const updateData: Record<string, any> = {
      scheduleName,
      feedingTimes,
      foodType,
      brandName,
      quantity: Number(quantity) || 0,
      updatedAt: serverTimestamp(),
    };

    if (eventDate) {
      updateData.eventDate = Timestamp.fromDate(new Date(eventDate));
    }

    await updateDoc(docRef, updateData);
    return NextResponse.json({ message: "Schedule event updated successfully" });
  } catch (error) {
    console.error("Error updating diet schedule event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const { id } = context.params;
    const docRef = doc(db, "dietScheduleEvents", id);
    await deleteDoc(docRef);
    return NextResponse.json({ message: "Schedule event deleted successfully" });
  } catch (error) {
    console.error("Error deleting diet schedule event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
