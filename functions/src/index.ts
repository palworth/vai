// functions/src/index.ts

import { onCallGenkit, isSignedIn } from 'firebase-functions/https';
// import { hasClaim } from 'firebase-functions/https';
import { genkit, z } from 'genkit';
import { generateDogResponse } from './genkit-rag-chat-flow';
import { vertexAI } from '@genkit-ai/vertexai';
import { defineSecret } from 'firebase-functions/params';

// Import your new API Cloud Functions:
import { getHealthEventsByDog, getHealthEventById, getAllHealthEventsByUser } from './api/health-events/route';

import { createHealthEvent } from './api/events/createHealthEvent'
import { getEventsByDog } from './api/events/getEventsByDog'
import { getEventById } from './api/events/getEventById'
import { createWellnessEvent } from './api/events/createWellnessEvent'
import { createBehaviorEvent } from './api/events/createBehaviorEvent'
import { createExerciseEvent } from './api/events/createExerciseEvent'
import { createDietScheduleEvent } from './api/events/createDietScheduleEvent'

import { createPoopJournalEvent } from './api/events/createPoopJournalEvent'
import { createVetAppointmentEvent } from './api/events/createVetAppointmentEvent'
import { createVaccinationAppointmentEvent } from './api/events/createVaccinationAppointmentEvent'
import { createWeightChangeEvent } from './api/events/createWeightChangeEvent'
import { createDietExceptionEvent } from './api/events/createDietExceptionEvent' 
import { getAllEventsForUser } from './api/events/getAllEventsForUser' 

//API key in google secret manager 
const apiKey = defineSecret("GOOGLE_GENAI_API_KEY");

// if (process.env.NODE_ENV !== "production") {
//     require("dotenv").config({ path: ".env.flocal" });
//   }
  
// Create a Genkit instance with the prompt directory and plugin configuration.
const ai = genkit({
  promptDir: "./prompts",
  plugins: [vertexAI({ location: "us-central1" })],
});

// Define the Genkit flow that wraps your generateDogResponse function.
// The flow takes an object with "dogId" and "testQuestion" and returns a string.
const dogResponseFlow = ai.defineFlow(
  {
    name: "generateDogResponseFlow",
    inputSchema: z.object({
      dogId: z.string(),
      testQuestion: z.string(),
    }),
    outputSchema: z.string(),
  },
  async (input: { dogId: string; testQuestion: string }) => {
    return await generateDogResponse(input);
  }
);

// Create a wrapper object that satisfies the GenkitAction interface required by onCallGenkit.
// Note: onCallGenkit expects the run and __action methods to return a Promise resolving to an object
// with a "result" property, and the stream method to synchronously return an object with properties "stream" and "output".
const dogResponseAction = {
  name: "generateDogResponseFlow",
  run: async (input: any) => {
    const result = await dogResponseFlow(input);
    return { result };
  },
  __action: async (input: any) => {
    const result = await dogResponseFlow(input);
    return { result };
  },
  stream: (input: any, options: any) => {
    // Call the flow once and store its promise.
    const resultPromise = dogResponseFlow(input);
    // Create an async generator that yields the result.
    const generator = (async function* () {
      yield await resultPromise;
    })();
    return {
      stream: generator,
      output: resultPromise.then(result => ({ result }))
    };
  }
};

// Export the callable Cloud Function by wrapping the action with onCallGenkit.
// Here we add an auth policy (users must have a verified email) and enforce App Check.
export const generateDogResponseFunction = onCallGenkit(
  {
    // authPolicy: hasClaim("email_verified"),
    // enforceAppCheck: true,
    secrets: [apiKey],
    authPolicy: isSignedIn(),
    cors: true,
  },
  dogResponseAction
);

export { getHealthEventsByDog, createHealthEvent, getHealthEventById, getAllHealthEventsByUser, 
          getEventsByDog, getEventById, createBehaviorEvent, createExerciseEvent, 
          createWellnessEvent, createDietScheduleEvent, createPoopJournalEvent, createVetAppointmentEvent,
          createVaccinationAppointmentEvent, createWeightChangeEvent, createDietExceptionEvent, getAllEventsForUser};