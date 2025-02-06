import { genkit, z } from "genkit";
import { gemini15Flash } from "@genkit-ai/googleai";
import { firebaseAuth } from "@genkit-ai/firebase/auth";
import { onFlow } from "@genkit-ai/firebase/functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK (ensure your service account is set up)
admin.initializeApp();

const ai = genkit({
  plugins: [
    // Configure your Google AI plugin here if needed.
  ],
});

// We update the input schema to accept an object with a question and a dogId.
export const dogVetChatFlow = onFlow(
  ai,
  {
    name: "dogVetChatFlow",
    inputSchema: z.object({
      question: z.string(),
      dogId: z.string(),
    }),
    outputSchema: z.string(),
    authPolicy: firebaseAuth((user, context) => {
      console.log("AuthPolicy invoked. User:", user);
      console.log("Context:", context);
      const authHeader = context?.headers?.authorization || "";
      console.log("Authorization header:", authHeader);
      if (!authHeader) {
        console.warn("No authorization header found; skipping header check for testing.");
        return true; // Allow for testing; in production, you’d enforce a valid token.
      }
      return true;
    }),
  },
  // Our callback now accepts 2 arguments: input and context.
  // The input is an object with 'question' and 'dogId'.
  async (input, context) => {
    const { question, dogId } = input;
    // For security, we ignore any userId sent from the client.
    // Instead, we assume the firebaseAuth plugin provides the authenticated user in context.
    // For example, if context.user is set, use it:
    const userId = context?.user?.uid;
    if (!userId) {
      throw new Error("No authenticated user found.");
    }
    
    const db = admin.database();

    // Fetch dog's data from the Realtime Database.
    const dogRef = db.ref(`dogs/${dogId}`);
    const dogData = await dogRef.once("value").then((snapshot) => snapshot.val());

    // Fetch events for the dog.
    const dietEvents = await db
      .ref("dietEvents")
      .orderByChild("dogId")
      .equalTo(dogId)
      .once("value")
      .then((snapshot) => snapshot.val());
    const behaviorEvents = await db
      .ref("behaviorEvents")
      .orderByChild("dogId")
      .equalTo(dogId)
      .once("value")
      .then((snapshot) => snapshot.val());
    const exerciseEvents = await db
      .ref("exerciseEvents") // Ensure the collection name is correct.
      .orderByChild("dogId")
      .equalTo(dogId)
      .once("value")
      .then((snapshot) => snapshot.val());
    const healthEvents = await db
      .ref("healthEvents")
      .orderByChild("dogId")
      .equalTo(dogId)
      .once("value")
      .then((snapshot) => snapshot.val());
    const wellnessEvents = await db
      .ref("wellnessEvents")
      .orderByChild("dogId")
      .equalTo(dogId)
      .once("value")
      .then((snapshot) => snapshot.val());

    // Construct the prompt.
    const prompt = `
      You are a helpful dog vet chatbot.
      Here is information about the dog: ${JSON.stringify(dogData)}
      Here are the dog's diet events: ${JSON.stringify(dietEvents)}
      Here are the dog's behavior events: ${JSON.stringify(behaviorEvents)}
      Here are the dog's exercise events: ${JSON.stringify(exerciseEvents)}
      Here are the dog's health events: ${JSON.stringify(healthEvents)}
      Here are the dog's wellness events: ${JSON.stringify(wellnessEvents)}
      The user asked: ${question}
      Please provide a helpful and informative response.
    `;

    // Call Gemini using Genkit.
    const llmResponse = await ai.generate({
      model: gemini15Flash,
      prompt: prompt,
      config: {
        temperature: 0.7,
      },
    });

    return llmResponse.text;
  }
);
