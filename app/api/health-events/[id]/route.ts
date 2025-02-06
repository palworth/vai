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
    const { id } = await context.params as { id: string | string[] };
    const normalizedId = Array.isArray(id) ? id[0] : id;
    const docRef = doc(db, "healthEvents", normalizedId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const data = docSnap.data();
    return NextResponse.json({
      id: docSnap.id,
      type: "health", // Explicitly set type to health
      ...data,
      dogId: data.dogId?.id || data.dogId,
      userId: data.userId?.id || data.userId,
      eventDate: data.eventDate?.toDate?.()?.toISOString() || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error fetching health event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
// @ts-expect-error: Disable implicit any for context parameter.
export async function PUT(request: Request, context) {
  try {
    const { id } = await context.params as { id: string | string[] };
    const normalizedId = Array.isArray(id) ? id[0] : id;
    const body = await request.json();
    const docRef = doc(db, "healthEvents", normalizedId);

    const { eventType, notes, severity, eventDate } = body;
    const updateData: Record<string, any> = {
      eventType,
      notes,
      severity: Number(severity) || 1,
      updatedAt: serverTimestamp(),
    };

    if (eventDate) {
      updateData.eventDate = Timestamp.fromDate(new Date(eventDate));
    }

    await updateDoc(docRef, updateData);
    return NextResponse.json({ message: "Event updated successfully" });
  } catch (error) {
    console.error("Error updating health event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
// @ts-expect-error: Disable implicit any for context parameter.
export async function DELETE(request: Request, context) {
  try {
    const { id } = await context.params as { id: string | string[] };
    const normalizedId = Array.isArray(id) ? id[0] : id;
    const docRef = doc(db, "healthEvents", normalizedId);
    await deleteDoc(docRef);
    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting health event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
