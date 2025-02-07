// functions/src/genkit-console-firestore.ts

import { genkit } from "genkit";
import * as admin from "firebase-admin";
import dotenv from "dotenv";
import { vertexAI, gemini15Flash } from "@genkit-ai/vertexai";

// Load environment variables from .env.local (if needed)
dotenv.config({ path: "./.env.local" });
console.log("Initializing Firebase Admin for Firestore");

// Initialize firebase-admin (for Firestore, no databaseURL is needed)
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Create your Genkit instance.
const ai = genkit({
  plugins: [
    vertexAI({ location: "us-central1" }),
  ],
});

// Hardcoded test values.
const testDogId = "BehmMIAzpENDWfWtAVdI"; // Replace with a valid dog document ID from your Firestore.
const testQuestion = "What is a healthy diet for my dog?";

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

    // Fetch diet events for the dog.
    const dietSnapshot = await db.collection("dietEvents")
      .where("dogId", "==", dogRef)
      .get();
    const dietEvents = dietSnapshot.docs.map(doc => doc.data());
    console.log("Diet Events:", dietEvents);

    // Fetch behavior events for the dog.
    const behaviorSnapshot = await db.collection("behaviorEvents")
      .where("dogId", "==", dogRef)
      .get();
    const behaviorEvents = behaviorSnapshot.docs.map(doc => doc.data());
    console.log("Behavior Events:", behaviorEvents);

    // Fetch exercise events for the dog.
    const exerciseSnapshot = await db.collection("exerciseEvents")
      .where("dogId", "==", dogRef)
      .get();
    const exerciseEvents = exerciseSnapshot.docs.map(doc => doc.data());
    console.log("Exercise Events:", exerciseEvents);

    // Fetch health events for the dog.
    const healthSnapshot = await db.collection("healthEvents")
      .where("dogId", "==", dogRef)
      .get();
    const healthEvents = healthSnapshot.docs.map(doc => doc.data());
    console.log("Health Events:", healthEvents);

    // Fetch wellness events for the dog.
    const wellnessSnapshot = await db.collection("wellnessEvents")
      .where("dogId", "==", dogRef)
      .get();
    const wellnessEvents = wellnessSnapshot.docs.map(doc => doc.data());
    console.log("Wellness Events:", wellnessEvents);

    // Construct the prompt.
    const prompt = `
      You are a helpful dog vet chatbot.
      Here is information about the dog: ${JSON.stringify(simplifiedDogData)}
      Here are the dog's diet events: ${JSON.stringify(dietEvents)}
      Here are the dog's behavior events: ${JSON.stringify(behaviorEvents)}
      Here are the dog's exercise events: ${JSON.stringify(exerciseEvents)}
      Here are the dog's health events: ${JSON.stringify(healthEvents)}
      Here are the dog's wellness events: ${JSON.stringify(wellnessEvents)}
      The user asked: ${testQuestion}
      Please provide a helpful and informative response.
    `;
    console.log("Prompt:", prompt);

    // Generate a response using the Gemini model.
    const llmResponse = await ai.generate({
      model: gemini15Flash,
      prompt,
      config: { temperature: 0.7 },
    });

    console.log("LLM Response:", llmResponse.text);
  } catch (error) {
    console.error("Error generating LLM response:", error);
  }
})();
