import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Helper to format Firestore timestamps.
function formatTimestamp(timestamp: any): string {
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toISOString();
  }
  return String(timestamp);
}

/**
 * POST /api/events
 * Creates a new "exercise" event.
 * Expects JSON body with:
 *   - Required: userId, dogId, activityType, source, distance, duration
 *   - Optional: eventDate
 * 
 * Dog snapshot data (dogName, dogBreed, dogAge, sterilizationStatus) are fetched
 * from the dog document referenced by dogId.
 */
export const createExerciseEvent = functions.https.onRequest({ cors: true }, async (req, res) => {
  try {
    const { userId, dogId, eventDate, activityType, source, distance, duration, imageUrls } = req.body;

    // Validate required fields.
    if (!userId || !dogId || !activityType || !source || distance === undefined || duration === undefined) {
      res.status(400).json({ error: "Missing required fields: userId, dogId, activityType, source, distance, and duration" });
      return;
    }

    // Build document references.
    const userRef = db.collection("users").doc(userId);
    const dogRef = db.collection("dogs").doc(dogId);

    // Fetch dog snapshot for meta data.
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
      type: "exercise", // Marks this event as an exercise event.
      
      // Add imageUrls as a top-level field.
      imageUrls: imageUrls || [],
      // Snapshot fields.
      dogName: dogData?.name || null,
      dogBreed: dogData?.breed || null,
      dogAge: dogData?.age || null,
      sterilizationStatus: dogData?.sterilizationStatus !== undefined ? dogData.sterilizationStatus : null,
      
      // Exercise-specific data.
      data: {
        activityType: activityType || null,
        source: source || null,
        distance: distance || null,
        duration: duration || null
      }
    };

    // Create the event document.
    const docRef = await db.collection("events").add(newEventData);

    // Format timestamps for response.
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
    console.error("Error creating exercise event:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
});
