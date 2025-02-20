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
 * GET /api/events?dogId=<DOG_ID>&type=<EVENT_TYPE>
 * Returns all events for a given dog.
 * If the optional query parameter `type` is provided,
 * it will return only events of that type.
 */
export const getEventsByDog = functions.https.onRequest({ cors: true }, async (req, res) => {
  try {
    // Use "dogId" from the query parameters.
    const dogId = req.query.dogId as string;
    if (!dogId) {
      res.status(400).json({ error: "Missing dogId parameter" });
      return;
    }

    // Construct a reference to the dog document.
    const dogRef = db.collection("dogs").doc(dogId);

    // Build the query to the "events" collection filtering by dogId.
    let query: admin.firestore.Query = db.collection("events")
      .where("dogId", "==", dogRef);

    // If an event type filter is provided, add it to the query.
    if (req.query.type) {
      query = query.where("type", "==", req.query.type);
    }

    // Execute the query.
    const snapshot = await query.get();

    // Map over the results to return a clean JSON array.
    const events = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore document references to plain IDs.
        userId: data.userId?.id,
        dogId: data.dogId?.id,
        createdAt: formatTimestamp(data.createdAt),
        updatedAt: formatTimestamp(data.updatedAt),
        eventDate: formatTimestamp(data.eventDate)
      };
    });

    res.status(200).json(events);
    return;
  } catch (error) {
    console.error("Error fetching events for dog:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
});
