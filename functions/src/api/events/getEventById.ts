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
 * GET /api/events?id=<EVENT_ID>
 * Fetches an event document from the unified "events" collection.
 * The event ID should be passed as a query parameter "id".
 */
export const getEventById = functions.https.onRequest({ cors: true }, async (req, res) => {
  try {
    // Retrieve the event ID from the query parameters.
    const eventId = req.query.id as string;
    if (!eventId) {
      res.status(400).json({ error: "Missing event ID" });
      return;
    }

    // Fetch the event document from the "events" collection.
    const eventDoc = await db.collection("events").doc(eventId).get();
    if (!eventDoc.exists) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    const data = eventDoc.data();

    // Format the document data, converting references to plain IDs
    // and formatting timestamps.
    const formattedData = {
      id: eventDoc.id,
      ...data,
      userId: data?.userId?.id,  // convert Firestore reference to string ID
      dogId: data?.dogId?.id,
      createdAt: formatTimestamp(data?.createdAt),
      updatedAt: formatTimestamp(data?.updatedAt),
      eventDate: formatTimestamp(data?.eventDate)
    };

    res.status(200).json(formattedData);
    return;
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
});
