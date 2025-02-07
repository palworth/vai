import { NextResponse } from "next/server";
import { dogVetChatFlow } from "../../../functions/src/genkit-first-flow";
import * as admin from 'firebase-admin';

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

export async function POST(request: Request) {
  try {
    // Extract the request payload.
    const { message, dogId } = await request.json();
    if (!message || !dogId) {
      return NextResponse.json(
        { error: "Missing message or dogId" },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("authorization");
    console.log("Auth header received:", authHeader); // Debug log

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }

    // Verify the header format
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Invalid authorization header format" },
        { status: 401 }
      );
    }

    // Verify the ID token using the Firebase Admin SDK
    const idToken = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('Decoded token:', decodedToken);
    } catch (error) {
      console.error('Error verifying ID token:', error);
      return NextResponse.json(
        { error: "Invalid or expired ID token" },
        { status: 401 }
      );
    }

    // Call the Genkit flow with the provided message, userId, and dogId.
    const response = await dogVetChatFlow(
      { question: message, dogId }, // Pass input data as an object
      // Remove manual context passing
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in /api/test-chat:", error);
    return NextResponse.json({ error: "Error generating response" }, { status: 500 });
  }
}
