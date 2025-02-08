// lib/firebaseAdmin.ts
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountString) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT environment variable.");
  }
  const serviceAccount = JSON.parse(serviceAccountString);
  console.log("Parsed service account:", serviceAccount)

  // Ensure serviceAccount.project_id exists and is a string
  if (typeof serviceAccount.project_id !== "string") {
    throw new Error("Service account object must contain a string 'project_id' property.");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
} else {
  admin.app();
}

export const db = admin.firestore();
