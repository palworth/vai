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

    // Fetch raw events from Firestore from the root-level "events" collection.
    const dietExceptionRaw = (await db.collection("events")
      .where("dogId", "==", dogRef)
      .where("type", "==", "dietException")
      .get()).docs.map(doc => doc.data());
    const behaviorRaw = (await db.collection("events")
      .where("dogId", "==", dogRef)
      .where("type", "==", "behavior")
      .get()).docs.map(doc => doc.data());
    const exerciseRaw = (await db.collection("events")
      .where("dogId", "==", dogRef)
      .where("type", "==", "exercise")
      .get()).docs.map(doc => doc.data());
    const healthRaw = (await db.collection("events")
      .where("dogId", "==", dogRef)
      .where("type", "==", "health")
      .get()).docs.map(doc => doc.data());
    const wellnessRaw = (await db.collection("events")
      .where("dogId", "==", dogRef)
      .where("type", "==", "wellness")
      .get()).docs.map(doc => doc.data());

    // Additional queries for new event types.
    const dietScheduleRaw = (await db.collection("events")
      .where("dogId", "==", dogRef)
      .where("type", "==", "dietSchedule")
      .get()).docs.map(doc => doc.data());
    const poopJournalRaw = (await db.collection("events")
      .where("dogId", "==", dogRef)
      .where("type", "==", "poopJournal")
      .get()).docs.map(doc => doc.data());
    const vetAppointmentRaw = (await db.collection("events")
      .where("dogId", "==", dogRef)
      .where("type", "==", "vetAppointment")
      .get()).docs.map(doc => doc.data());
    const vaccinationAppointmentRaw = (await db.collection("events")
      .where("dogId", "==", dogRef)
      .where("type", "==", "vaccinationAppointment")
      .get()).docs.map(doc => doc.data());
    const weightChangeRaw = (await db.collection("events")
      .where("dogId", "==", dogRef)
      .where("type", "==", "weightChange")
      .get()).docs.map(doc => doc.data());

    // Clean up events arrays.
    const dietEvents = dietExceptionRaw.map(e => ({
      foodType: e.data?.foodType,
      notes: e.data?.notes,
      amount: e.data?.amount,
      eventDate: e.eventDate,
    }));
    const behaviorEvents = behaviorRaw.map(e => ({
      behaviorType: e.data?.behaviorType,
      severity: e.data?.severity,
      notes: e.data?.notes,
      eventDate: e.eventDate,
    }));
    const exerciseEvents = exerciseRaw.map(e => ({
      activityType: e.data?.activityType,
      duration: e.data?.duration,
      distance: e.data?.distance,
      source: e.data?.source,
      eventDate: e.eventDate,
    }));
    const healthEvents = healthRaw.map(e => ({
      eventType: e.data?.eventType,
      severity: e.data?.severity,
      notes: e.data?.notes,
      eventDate: e.eventDate,
    }));
    const wellnessEvents = wellnessRaw.map(e => ({
      mentalState: e.data?.mentalState,
      severity: e.data?.severity,
      notes: e.data?.notes,
      eventDate: e.eventDate,
    }));
    const dietScheduleEvents = dietScheduleRaw.map(e => ({
      endDate: e.data?.endDate,
      feedingTimes: e.data?.feedingTimes,
      brandName: e.data?.brandName,
      foodType: e.data?.foodType,
      quantity: e.data?.quantity,
      dogImageUrl: e.data?.dogImageUrl,
      eventDate: e.eventDate,
    }));
    const poopJournalEvents = poopJournalRaw.map(e => ({
      notes: e.data?.notes,
      solidScale: e.data?.solidScale,
      eventDate: e.eventDate,
    }));
    const vetAppointmentEvents = vetAppointmentRaw.map(e => ({
      appointmentType: e.data?.appointmentType,
      vetName: e.data?.vetName,
      notes: e.data?.notes,
      vetDocuments: e.data?.vetDocuments,
      eventDate: e.eventDate,
    }));
    const vaccinationAppointmentEvents = vaccinationAppointmentRaw.map(e => ({
      vaccinationsType: e.data?.vaccinationsType,
      vetName: e.data?.vetName,
      notes: e.data?.notes,
      vetDocuments: e.data?.vetDocuments,
      eventDate: e.eventDate,
    }));
    const weightChangeEvents = weightChangeRaw.map(e => ({
      weight: e.data?.weight,
      eventDate: e.eventDate,
    }));

    // Build the input for the prompt.
    const promptInput = {
      simplifiedDogData,
      dietEvents,
      dietScheduleEvents,
      behaviorEvents,
      exerciseEvents,
      healthEvents,
      wellnessEvents,
      poopJournalEvents,
      vetAppointmentEvents,
      vaccinationAppointmentEvents,
      weightChangeEvents,
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
