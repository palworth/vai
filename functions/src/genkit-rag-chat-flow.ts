// functions/src/genkit-rag-chat-flow.ts

import { genkit } from "genkit";
import * as admin from "firebase-admin";
// import dotenv from "dotenv";
import { vertexAI } from "@genkit-ai/vertexai";

// Load environment variables if needed
// dotenv.config({ path: ".env.flocal" });
// console.log("Initializing Firebase Admin for Firestore (RAG Chat Flow)");

// Initialize firebase-admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Initialize Genkit with prompt directory and vertexAI plugin.
const ai = genkit({
  promptDir: "./prompts",
  plugins: [vertexAI({ location: "us-central1" })],
});

// Define a helper for rendering objects as formatted JSON.
ai.defineHelper("json", (obj: unknown) => JSON.stringify(obj, null, 2));

// Preload the prompt action during module initialization so that it is defined only once.
// This prevents the "Cannot define new actions at runtime" error.
const dogVetPrompt = ai.prompt("dog-vet-prompt");

// Warm-up call: force the prompt (and any dependent model actions) to be defined at initialization.
// Provide dummy input that roughly matches the expected structure.
// (Adjust the dummy values as needed for your prompt.)
dogVetPrompt({
  simplifiedDogData: {},
  dietEvents: [],
  behaviorEvents: [],
  exerciseEvents: [],
  healthEvents: [],
  wellnessEvents: [],
  testQuestion: "warmup"
}).catch((err) => {
  console.warn("Warmup call for dog-vet-prompt failed (this may be expected if dummy input is invalid):", err.message);
});

/**
 * Generates a response using our dog-vet prompt.
 * @param params Object containing the dogId and testQuestion.
 * @returns The generated text from the prompt.
 */
export async function generateDogResponse({ dogId, testQuestion }: { dogId: string; testQuestion: string }): Promise<string> {
  try {
    // Create a DocumentReference for the dog.
    const dogRef = db.doc(`/dogs/${dogId}`);
    console.log("path to doggy", dogRef)

    // Fetch dog's data from Firestore.
    const dogDoc = await dogRef.get();
    if (!dogDoc.exists) {
      console.error("No document found for dogId:", dogId);
    } else {
      console.log("Dog document data:", dogDoc.data());
    }
    const dogData = dogDoc.data();

    // Simplify the dog's data.
    const simplifiedDogData = {
      age: dogData?.age,
      breed: dogData?.breed,
      name: dogData?.name,
      sex: dogData?.sex,
      weight: dogData?.weight,
    };
    console.log("Simplified Dog Data:", simplifiedDogData);

    // Fetch raw events from Firestore.
    const dietRaw = (await db.collection("dietEvents").where("dogId", "==", dogRef).get()).docs.map(doc => doc.data());
    const behaviorRaw = (await db.collection("behaviorEvents").where("dogId", "==", dogRef).get()).docs.map(doc => doc.data());
    const exerciseRaw = (await db.collection("exerciseEvents").where("dogId", "==", dogRef).get()).docs.map(doc => doc.data());
    const healthRaw = (await db.collection("healthEvents").where("dogId", "==", dogRef).get()).docs.map(doc => doc.data());
    const wellnessRaw = (await db.collection("wellnessEvents").where("dogId", "==", dogRef).get()).docs.map(doc => doc.data());

    // Clean up events arrays.
    const dietEvents = dietRaw.map(e => ({
      foodType: e.foodType,
      brandName: e.brandName,
      eventDate: e.eventDate
    }));
    const behaviorEvents = behaviorRaw.map(e => ({
      behaviorType: e.behaviorType,
      severity: e.severity,
      notes: e.notes,
      eventDate: e.eventDate
    }));
    const exerciseEvents = exerciseRaw.map(e => ({
      eventDate: e.eventDate,
      activityType: e.activityType,
      duration: e.duration,
      distance: e.distance,
      source: e.source
    }));
    const healthEvents = healthRaw.map(e => ({
      eventType: e.eventType,
      severity: e.severity,
      notes: e.notes,
      eventDate: e.eventDate
    }));
    const wellnessEvents = wellnessRaw.map(e => ({
      type: e.type,
      mentalState: e.mentalState,
      severity: e.severity,
      notes: e.notes,
      eventDate: e.eventDate
    }));


    // Build the input for the prompt.
    const promptInput = {
      simplifiedDogData,
      dietEvents,
      behaviorEvents,
      exerciseEvents,
      healthEvents,
      wellnessEvents,
      testQuestion, // Now we include testQuestion from the parameters.
    };

    // Use the preloaded prompt action (dogVetPrompt) to generate the output.
    const promptOutput = await dogVetPrompt(promptInput);

    console.log("LLM Response:", promptOutput.text);
    return promptOutput.text;
  } catch (error) {
    console.error("Error generating LLM response:", error);
    throw error;
  }
}
