import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as dotenv from "dotenv";

// Load environment variables from the .env file
dotenv.config();

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace literal "\n" with actual newlines in the private key
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

// Export your Firebase Admin instances
export const adminDb = admin.database(); // For Realtime Database
export const adminFirestore = admin.firestore(); // For Cloud Firestore

// Example: Accessing Realtime Database
export const getRealtimeData = functions.https.onRequest(async (req, res) => {
  try {
    const path = req.query.path; // Get path from query parameter
    if (!path) {
      return res.status(400).send('Missing path parameter');
    }

    const snapshot = await adminDb.ref(path).once('value');
    const data = snapshot.val();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching Realtime Database data:', error);
    res.status(500).send('Error fetching data');
  }
});

// Example: Accessing Cloud Firestore
export const getFirestoreData = functions.https.onRequest(async (req, res) => {
  try {
    const collectionName = req.query.collection; // Get collection name from query parameter
    const docId = req.query.docId; // Get document ID from query parameter

    if (!collectionName) {
      return res.status(400).send('Missing collection parameter');
    }

    const collectionRef = adminFirestore.collection(collectionName);
    if (docId) {
      const docRef = collectionRef.doc(docId);
      const doc = await docRef.get();
      res.status(200).json(doc.data());
    } else {
      const snapshot = await collectionRef.get();
      const data = snapshot.docs.map((doc) => doc.data());
      res.status(200).json(data);
    }
  } catch (error) {
    console.error('Error fetching Cloud Firestore data:', error);
    res.status(500).send('Error fetching data');
  }
});

// Example: Triggered by a Firestore document write
export const onDocumentWrite = functions.firestore.document('users/{userId}').onWrite(async (change, context) => {
  const before = change.before.data();
  const after = change.after.data();

  // Perform actions based on the document change
  console.log('Document updated:', context.params.userId);
  console.log('Before:', before);
  console.log('After:', after);
});
