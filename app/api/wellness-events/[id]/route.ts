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
    const docRef = doc(db, "wellnessEvents", normalizedId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const data = docSnap.data();
    return NextResponse.json({
      id: docSnap.id,
      type: "wellness", // explicitly set type to wellness
      ...data,
      dogId: data.dogId?.id || data.dogId,
      userId: data.userId?.id || data.userId,
      eventDate: data.eventDate?.toDate?.()?.toISOString() || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error fetching wellness event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
// @ts-expect-error: Disable implicit any for context parameter.
export async function PUT(request: Request, context) {
  try {
    const { id } = await context.params as { id: string | string[] };
    const normalizedId = Array.isArray(id) ? id[0] : id;
    const body = await request.json();
    const docRef = doc(db, "wellnessEvents", normalizedId);

    const { mentalState, severity, notes, eventDate } = body;
    const updateData: Record<string, any> = {
      mentalState,
      severity: Number(severity) || 1,
      notes: notes || "",
      updatedAt: serverTimestamp(),
    };

    if (eventDate) {
      updateData.eventDate = Timestamp.fromDate(new Date(eventDate));
    }

    await updateDoc(docRef, updateData);
    return NextResponse.json({ message: "Event updated successfully" });
  } catch (error) {
    console.error("Error updating wellness event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
// @ts-expect-error: Disable implicit any for context parameter.
export async function DELETE(request: Request, context) {
  try {
    const { id } = await context.params as { id: string | string[] };
    const normalizedId = Array.isArray(id) ? id[0] : id;
    const docRef = doc(db, "wellnessEvents", normalizedId);
    await deleteDoc(docRef);
    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting wellness event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
