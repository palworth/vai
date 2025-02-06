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
// @ts-expect-error: Disable implicit any for context parameter.
export async function GET(request: Request, context) {
  try {
    // Assert the type for context.params and normalize the id.
    const { id } = context.params as { id: string | string[] };
    const normalizedId = Array.isArray(id) ? id[0] : id;

    // IMPORTANT: Make sure that the collection name "behaviorEvents" exactly matches your Firestore collection name.
    const docRef = doc(db, "behaviorEvents", normalizedId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const data = docSnap.data();
    return NextResponse.json({
      id: docSnap.id,
      type: "behavior", // Ensure that type is included for routing/display
      ...data,
      dogId: data.dogId?.id || data.dogId, // Convert reference to string if needed
      userId: data.userId?.id || data.userId,
      eventDate: data.eventDate?.toDate?.()?.toISOString() || data.eventDate || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error fetching behavior event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
// @ts-expect-error: Disable implicit any for context parameter.
export async function PUT(request: Request, context) {
  try {
    const { id } = context.params as { id: string | string[] };
    const normalizedId = Array.isArray(id) ? id[0] : id;
    const body = await request.json();
    const docRef = doc(db, "behaviorEvents", normalizedId);

    // Extract only the fields we want to update.
    const { behaviorType, severity, notes, eventDate } = body;
    const updateData = {
      behaviorType,
      severity,
      notes,
      eventDate: eventDate ? Timestamp.fromDate(new Date(eventDate)) : null,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updateData);
    return NextResponse.json({ message: "Event updated successfully" });
  } catch (error) {
    console.error("Error updating behavior event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
// @ts-expect-error: Disable implicit any for context parameter.
export async function DELETE(request: Request, context) {
  try {
    const { id } = context.params as { id: string | string[] };
    const normalizedId = Array.isArray(id) ? id[0] : id;
    const docRef = doc(db, "behaviorEvents", normalizedId);
    await deleteDoc(docRef);
    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting behavior event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
