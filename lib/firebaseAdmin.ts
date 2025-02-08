// lib/firebaseAdmin.ts

import * as admin from "firebase-admin";
import serviceAccount from "@/config/vai2-80fb0-4b4946372e42.json";

let adminApp: admin.app.App;

if (!admin.apps.length) {
  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
} else {
  adminApp = admin.app();
}

export const db = adminApp.firestore();
// (Optional) Export other Firebase services if needed
// export const auth = adminApp.auth();
// export const storage = adminApp.storage();
