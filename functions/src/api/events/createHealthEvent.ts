import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Helper to format Firestore Timestamps into strings.
function formatTimestamp(timestamp: any): string {
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toISOString();
  }
  return String(timestamp);
}

/**
 * POST /api/events
 * Creates a new "health" event.
 * Expects JSON body with:
 *   - Required: userId, dogId, eventType, severity
 *   - Optional: eventDate, notes
 * 
 * Dog snapshot data (dogName, dogBreed, dogAge, sterilizationStatus) are fetched
 * from the dog document referenced by dogId.
 */
export const createHealthEventNew = functions.https.onRequest({ cors: true }, async (req, res) => {
  try {
    const { userId, dogId, eventDate, eventType, severity, notes, imageUrls } = req.body;

    // Validate required fields.
    if (!userId || !dogId) {
      res.status(400).json({ error: "Missing required fields: userId and dogId" });
      return;
    }

    // Build Firestore document references.
    const userRef = db.collection("users").doc(userId);
    const dogRef = db.collection("dogs").doc(dogId);

    // Fetch dog document to get snapshot data.
    const dogSnapshot = await dogRef.get();
    if (!dogSnapshot.exists) {
      res.status(404).json({ error: "Dog not found" });
      return;
    }
    const dogData = dogSnapshot.data();

    // Set timestamps.
    const now = admin.firestore.FieldValue.serverTimestamp();
    const eventDateTs = eventDate
      ? admin.firestore.Timestamp.fromDate(new Date(eventDate))
      : now;

    // Build the event document data.
    const newEventData: any = {
      userId: userRef,
      dogId: dogRef,
      createdAt: now,
      updatedAt: now,
      eventDate: eventDateTs,
      type: "health", // Set the event type to "health".

      // Snapshot fields from the dog document.
      dogName: dogData?.name || null,
      dogBreed: dogData?.breed || null,
      dogAge: dogData?.age || null,
      sterilizationStatus: dogData?.sterilizationStatus !== undefined ? dogData.sterilizationStatus : null,

      // Add imageUrls as a top-level field.
      imageUrls: imageUrls || [],
      
      // Health event–specific data.
      data: {
        eventType: eventType || null,
        severity: severity || null,
        notes: notes !== undefined ? notes : ""
      }
    };

    // Create the event document in the "events" collection.
    const docRef = await db.collection("events").add(newEventData);

    // Format timestamps for the response.
    const createdAtStr = formatTimestamp(newEventData.createdAt);
    const updatedAtStr = formatTimestamp(newEventData.updatedAt);
    const eventDateStr = formatTimestamp(newEventData.eventDate);

    res.status(201).json({
      id: docRef.id,
      ...newEventData,
      createdAt: createdAtStr,
      updatedAt: updatedAtStr,
      eventDate: eventDateStr,
      userId,
      dogId
    });
    return;
  } catch (error) {
    console.error("Error creating health event:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
});
