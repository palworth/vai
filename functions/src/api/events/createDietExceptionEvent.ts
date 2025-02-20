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
 * Creates a new "dietException" event.
 * Expects JSON body with:
 *   - Required: userId, dogId
 *   - Optional: eventDate, foodType, notes, amount
 * 
 * Dog snapshot data is fetched from the dog document.
 */
export const createDietExceptionEvent = functions.https.onRequest({ cors: true }, async (req, res) => {
  try {
    const { userId, dogId, eventDate, foodType, notes, amount, imageUrls } = req.body;
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
      type: "dietException",
      dogName: dogData?.name || null,
      dogBreed: dogData?.breed || null,
      dogAge: dogData?.age || null,
      sterilizationStatus: dogData?.sterilizationStatus ?? null,
      // Add imageUrls as a top-level field.
      imageUrls: imageUrls || [],

      data: {
        foodType: foodType || "",
        notes: notes !== undefined ? notes : "",
        amount: amount !== undefined ? amount : null
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
    console.error("Error creating diet exception event:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
});
