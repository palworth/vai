// functions/src/genkit-console-rag.ts
// To run with the Google helper, do: genkit start -- tsx --watch functions/src/genkit-console-rag.ts
/* eslint-disable */


import { genkit } from "genkit";
import * as admin from "firebase-admin";
import dotenv from "dotenv";
import { vertexAI } from "@genkit-ai/vertexai";

// Load environment variables from .env.local (if needed)
dotenv.config({ path: "./.env.local" });
console.log("Initializing Firebase Admin for Firestore");

// Initialize firebase-admin (for Firestore, no databaseURL is needed)
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();


const ai = genkit({
  promptDir: "./prompts",
  plugins: [
    vertexAI({ location: "us-central1" }),
  ],
});

// Define a helper for rendering objects as formatted JSON.
ai.defineHelper("json", (obj: unknown) => JSON.stringify(obj, null, 2));

// Hardcoded test value.
const testDogId = "BehmMIAzpENDWfWtAVdI"; // Replace with a valid dog document ID from your Firestore.

(async () => {
  try {
    // Create a DocumentReference for the dog.
    const dogRef = db.doc(`/dogs/${testDogId}`);

    // Fetch dog's data from Firestore.
    const dogDoc = await dogRef.get();
    const dogData = dogDoc.data();

    // Simplify the dog's data to only include age, breed, name, sex, and weight.
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

    // Clean up each events array by selecting only the desired fields.
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
      mentalState: e.mentalState, // assuming the field is "mentalState" (not "metalState")
      severity: e.severity,
      notes: e.notes,
      eventDate: e.eventDate
    }));

    console.log("Cleaned Diet Events:", dietEvents);
    console.log("Cleaned Behavior Events:", behaviorEvents);
    console.log("Cleaned Exercise Events:", exerciseEvents);
    console.log("Cleaned Health Events:", healthEvents);
    console.log("Cleaned Wellness Events:", wellnessEvents);

    // Prepare input for the prompt.
    const promptInput = {
      simplifiedDogData,
      dietEvents,
      behaviorEvents,
      exerciseEvents,
      healthEvents,
      wellnessEvents,
      testQuestion: "What is a healthy diet for my dog?"
    };

    // Load and call the prompt by its registered name ("dog-vet-prompt").
    const promptOutput = await ai.prompt("dog-vet-prompt")(promptInput);

    // Log the rendered prompt (if your prompt file uses the json helper, the objects will be stringified).
    console.log("LLM Response:", promptOutput.text);
  } catch (error) {
    console.error("Error generating LLM response:", error);
  }
})();
// 