import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Helper function to format Firestore Timestamps (reusable)
function formatTimestamp(timestamp: any): string {
  if (timestamp && typeof timestamp === "object" && "seconds" in timestamp) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  }
  return String(timestamp);
}

// Helper function to fetch dog name from a DocumentReference
async function getDogName(dogRef: admin.firestore.DocumentReference): Promise<string> {
  try {
    const dogDoc = await dogRef.get();
    if (dogDoc.exists) {
      const dogData = dogDoc.data();
      return dogData?.name || "Unknown";
    }
  } catch (error) {
    console.error("Error fetching dog name:", error);
  }
  return "Unknown";
}

// GET /api/health-events (Cloud Function name: getHealthEventsByDog)
export const getHealthEventsByDog = functions.https.onRequest({ cors: true }, async (req, res) => {
  const dogId = req.query.dogId as string;
  console.log("Cloud Function - getHealthEventsByDog - Received dogId:", dogId);
  if (!dogId) {
    res.status(400).json({ error: "dogId is required" });
    return;
  }
  try {
    const dogRef = db.collection("dogs").doc(dogId);
    console.log("Cloud Function - getHealthEventsByDog - Constructed dogRef path:", dogRef.path);
    const healthEventsQuery = db.collection("healthEvents").where("dogId", "==", dogRef);
    const querySnapshot = await healthEventsQuery.get();
    console.log("Cloud Function - getHealthEventsByDog - Number of events found:", querySnapshot.docs.length);
    const events = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        dogId: data.dogId?.id,
        userId: data.userId?.id,
        createdAt: formatTimestamp(data.createdAt),
        updatedAt: formatTimestamp(data.updatedAt),
        eventDate: formatTimestamp(data.eventDate),
      };
    });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching health events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// // POST /api/health-events (Cloud Function name: createHealthEvent)
// export const createHealthEvent = functions.https.onRequest({ cors: true }, async (req, res) => {
//   try {
//     const body = req.body;
//     const dogId = body.dogId;
//     const userId = body.userId;
//     if (!dogId || !userId) {
//       res.status(400).json({ error: "dogId and userId are required in the request body" });
//       return;
//     }
//     const dogRef = db.collection("dogs").doc(body.dogId);
//     const userRef = db.collection("users").doc(body.userId);
//     const now = admin.firestore.FieldValue.serverTimestamp();
//     const eventData = {
//       ...body,
//       dogId: dogRef,
//       userId: userRef,
//       createdAt: now,
//       updatedAt: now,
//       eventDate: body.eventDate
//         ? admin.firestore.Timestamp.fromDate(new Date(body.eventDate))
//         : now,
//     };
//     const docRef = await db.collection("healthEvents").add(eventData);
//     res.status(201).json({
//       id: docRef.id,
//       ...body,
//       createdAt: formatTimestamp(eventData.createdAt),
//       updatedAt: formatTimestamp(eventData.updatedAt),
//       eventDate: formatTimestamp(eventData.eventDate),
//     });
//   } catch (error) {
//     console.error("Error creating health event:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// GET /api/health-events/{id} (Cloud Function name: getHealthEventById)
export const getHealthEventById = functions.https.onRequest({ cors: true }, async (req, res) => {
  try {
    const healthEventId = req.query.id as string;
    if (!healthEventId) {
      res.status(400).json({ error: "Health Event ID is required" });
      return;
    }
    const docRef = db.collection("healthEvents").doc(healthEventId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      res.status(404).json({ error: "Health event not found" });
      return;
    }
    const data = docSnap.data();
    if (!data) {
      res.status(500).json({ error: "Error retrieving event data from Firestore" });
      return;
    }
    let dogName = "Unknown Dog";
    if (data.dogId) {
      try {
        dogName = await getDogName(data.dogId);
      } catch (dogNameError) {
        console.error("Error fetching dog name:", dogNameError);
      }
    }
    res.status(200).json({
      id: docSnap.id,
      type: "health",
      ...data,
      dogName: dogName,
      eventDate: formatTimestamp(data.eventDate),
      createdAt: formatTimestamp(data.createdAt),
      updatedAt: formatTimestamp(data.updatedAt),
      userId: data.userId?.id || data.userId,
      dogId: data.dogId?.id || data.dogId,
    });
  } catch (error) {
    console.error("Error fetching health event by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// NEW FUNCTION: GET /api/health-events/data/all_per_user?userId=xxx (Cloud Function name: getAllHealthEventsByUser)
export const getAllHealthEventsByUser = functions.https.onRequest({ cors: true }, async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(400).json({ error: "Missing userId parameter" });
      return;
    }
    const userRef = db.collection("users").doc(userId);
    const healthEventsQuery = db.collection("healthEvents")
      .where("userId", "==", userRef)
      .orderBy("eventDate", "desc");
    const querySnapshot = await healthEventsQuery.get();
    const events = await Promise.all(
      querySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        let dogName = "Unknown";
        if (data.dogId && data.dogId.get) {
          dogName = await getDogName(data.dogId);
        }
        return {
          id: docSnap.id,
          dogName,
          eventDate: formatTimestamp(data.eventDate),
          eventType: data.eventType,
          severity: data.severity,
          notes: data.notes,
        };
      })
    );
    res.status(200).json({ healthEvents: events });
  } catch (error) {
    console.error("Error fetching health events by user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
