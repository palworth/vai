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

// GET a specific diet event by id.
// @ts-expect-error: Disable implicit any for context parameter.
export async function GET(request: Request, context) {
  try {
    const { id } = await context.params as { id: string | string[] };
    const normalizedId = Array.isArray(id) ? id[0] : id;
    const docRef = doc(db, "dietEvents", normalizedId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const data = docSnap.data();
    return NextResponse.json({
      id: docSnap.id,
      type: "diet", // Ensure we include the event type for routing/display purposes.
      ...data,
      dogId: data.dogId?.id || data.dogId,
      userId: data.userId?.id || data.userId,
      eventDate:
        data.eventDate?.toDate?.()?.toISOString() || data.eventDate || null,
      createdAt:
        data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt:
        data.updatedAt?.toDate?.()?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error fetching diet event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update a specific diet event.
// @ts-expect-error: Disable implicit any for context parameter.
export async function PUT(request: Request, context) {
  try {
    const { id } = await context.params as { id: string | string[] };
    const normalizedId = Array.isArray(id) ? id[0] : id;
    const body = await request.json();
    const docRef = doc(db, "dietEvents", normalizedId);

    // Extract the fields we want to update.
    const { foodType, brandName, quantity, eventDate } = body;

    const updateData: Record<string, any> = {
      foodType,
      brandName,
      quantity: Number(quantity) || 0,
      updatedAt: serverTimestamp(),
    };

    if (eventDate) {
      updateData.eventDate = Timestamp.fromDate(new Date(eventDate));
    }

    await updateDoc(docRef, updateData);
    return NextResponse.json({ message: "Event updated successfully" });
  } catch (error) {
    console.error("Error updating diet event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete a specific diet event.
// @ts-expect-error: Disable implicit any for context parameter.
export async function DELETE(request: Request, context) {
  try {
    const { id } = await context.params as { id: string | string[] };
    const normalizedId = Array.isArray(id) ? id[0] : id;
    const docRef = doc(db, "dietEvents", normalizedId);
    await deleteDoc(docRef);
    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting diet event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
