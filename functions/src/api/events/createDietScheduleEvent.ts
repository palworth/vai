import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Helper to format Firestore Timestamps into ISO strings.
function formatTimestamp(timestamp: any): string {
  if (timestamp && typeof timestamp === "object" && "seconds" in timestamp) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toISOString();
  }
  return String(timestamp);
}

/**
 * POST /api/events
 * Creates a new "dietSchedule" event.
 * Expects JSON body with:
 *   - Required: userId, dogId, quantity
 *   - Optional: eventDate, endDate, feedingTimes, brandName, foodType
 * 
 * Dog snapshot data (dogName, dogBreed, dogAge, sterilizationStatus) are fetched
 * from the dog document referenced by dogId.
 */
export const createDietScheduleEvent = functions.https.onRequest({ cors: true }, async (req, res) => {
  try {
    const { userId, dogId, eventDate, endDate, feedingTimes, brandName, foodType, quantity, imageUrls } = req.body;

    // Validate required fields.
    if (!userId || !dogId || quantity === undefined) {
      res.status(400).json({ error: "Missing required fields: userId, dogId, and quantity" });
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
    // Convert endDate if provided; otherwise, store null.
    const endDateTs = endDate ? admin.firestore.Timestamp.fromDate(new Date(endDate)) : null;

    // Build the event document data.
    const newEventData: any = {
      userId: userRef,
      dogId: dogRef,
      createdAt: now,
      updatedAt: now,
      eventDate: eventDateTs,
      type: "dietSchedule",
      
      // Snapshot fields from the dog document.
      dogName: dogData?.name || null,
      dogBreed: dogData?.breed || null,
      dogAge: dogData?.age || null,
      sterilizationStatus: dogData?.sterilizationStatus !== undefined ? dogData.sterilizationStatus : null,
      
      // Add imageUrls as a top-level field.
      imageUrls: imageUrls || [],
      // Diet Schedule–specific data nested in "data".
      data: {
        endDate: endDateTs,
        feedingTimes: feedingTimes || [],  // default to empty array if not provided
        brandName: brandName || "",          // default to empty string
        foodType: foodType || "",            // default to empty string
        quantity: quantity                   // quantity is required
      }
    };

    // Create the event document in the "events" collection.
    const docRef = await db.collection("events").add(newEventData);

    // Format timestamps for the response.
    const createdAtStr = formatTimestamp(newEventData.createdAt);
    const updatedAtStr = formatTimestamp(newEventData.updatedAt);
    const eventDateStr = formatTimestamp(newEventData.eventDate);
    const endDateStr = newEventData.data.endDate ? formatTimestamp(newEventData.data.endDate) : null;

    res.status(201).json({
      id: docRef.id,
      ...newEventData,
      createdAt: createdAtStr,
      updatedAt: updatedAtStr,
      eventDate: eventDateStr,
      data: {
        ...newEventData.data,
        endDate: endDateStr
      },
      userId,
      dogId
    });
    return;
  } catch (error) {
    console.error("Error creating diet schedule event:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
});
