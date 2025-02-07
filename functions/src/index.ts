import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as dotenv from "dotenv";
import { onDocumentWritten } from "firebase-functions/v2/firestore";

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
      res.status(400).send('Missing path parameter');
      return;
    }

    // Convert path to a string
    const pathString = Array.isArray(path) ? path[0] : String(path);
    if (typeof pathString !== 'string') {
      res.status(400).send('Invalid path parameter');
      return;
    }

    const snapshot = await adminDb.ref(pathString).once('value');
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
    const collectionName = Array.isArray(req.query.collection) 
      ? req.query.collection[0] 
      : String(req.query.collection);
    
    if (typeof collectionName !== 'string') {
      res.status(400).send('Invalid collection parameter');
      return;
    }

    const docId = req.query.docId ? String(req.query.docId) : undefined;

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
export const onDocumentWrite = onDocumentWritten("users/{userId}", async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();

  console.log('Document updated:', event.params.userId);
  console.log('Before:', before);
  console.log('After:', after);
});
