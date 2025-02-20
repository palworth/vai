import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();
function formatTimestamp(timestamp: any): string {
  if (timestamp && typeof timestamp === "object" && "seconds" in timestamp) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toISOString();
  }
  return String(timestamp);
}

/**
 * POST /api/events
 * Creates a new "vetAppointment" event.
 * Expects JSON body with:
 *   - Required: userId, dogId
 *   - Optional: eventDate, appointmentType, vetName, notes, vetDocuments (array)
 */
export const createVetAppointmentEvent = functions.https.onRequest({ cors: true }, async (req, res) => {
  try {
    const { userId, dogId, eventDate, appointmentType, vetName, notes, imageUrls } = req.body;
    if (!userId || !dogId) {
      res.status(400).json({ error: "Missing required fields: userId and dogId" });
      return;
    }
    const userRef = db.collection("users").doc(userId);
    const dogRef = db.collection("dogs").doc(dogId);
    const dogSnapshot = await dogRef.get();
    if (!dogSnapshot.exists) {
      res.status(404).json({ error: "Dog not found" });
      return;
    }
    const dogData = dogSnapshot.data();
    const now = admin.firestore.FieldValue.serverTimestamp();
    const eventDateTs = eventDate ? admin.firestore.Timestamp.fromDate(new Date(eventDate)) : now;

    const newEventData: any = {
      userId: userRef,
      dogId: dogRef,
      createdAt: now,
      updatedAt: now,
      eventDate: eventDateTs,
      type: "vetAppointment",
      dogName: dogData?.name || null,
      dogBreed: dogData?.breed || null,
      dogAge: dogData?.age || null,
      sterilizationStatus: dogData?.sterilizationStatus ?? null,
      data: {
        appointmentType: appointmentType || "",
        vetName: vetName || "",
        notes: notes !== undefined ? notes : "",
        vetDocuments: imageUrls || []  // expect array of URLs/doc references
      }
    };

    const docRef = await db.collection("events").add(newEventData);
    res.status(201).json({
      id: docRef.id,
      ...newEventData,
      userId,
      dogId,
      createdAt: formatTimestamp(newEventData.createdAt),
      updatedAt: formatTimestamp(newEventData.updatedAt),
      eventDate: formatTimestamp(newEventData.eventDate)
    });
    return;
  } catch (error) {
    console.error("Error creating vet appointment event:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
});
