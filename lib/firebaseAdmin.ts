// lib/firebaseAdmin.ts

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let adminApp: admin.app.App;

// Check if the app is already initialized
if (!admin.apps.length) {
  // Initialize the app if it's not already initialized
  const serviceAccount = require('@/config/vai2-80fb0-4b4946372e42.json'); // Replace with your actual path
  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  // Use the existing app if it's already initialized
  adminApp = admin.app();
}

// Export the Firestore instance
export const db = adminApp.firestore();

// (Optional) Export other Firebase services if needed
// export const auth = adminApp.auth();
// export const storage = adminApp.storage();
