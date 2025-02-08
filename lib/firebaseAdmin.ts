// lib/firebaseAdmin.ts

import * as admin from "firebase-admin";

// Ensure your environment variable is loaded (using dotenv if needed)
// dotenv.config() is typically called in your app's entry point.
if (!admin.apps.length) {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountString) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT environment variable.");
  }
  const serviceAccount = JSON.parse(serviceAccountString);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
} else {
  admin.app();
}

export const db = admin.firestore();
// Optionally, export other services:
// export const auth = admin.auth();
// export const storage = admin.storage();
