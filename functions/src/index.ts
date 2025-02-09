// import { onFlow, noAuth } from "@genkit-ai/firebase/functions";
// import { ai } from "./flow"; // Assuming your flow is in a file called 'flow.ts'

// // Import your flow definition
// import { yourFlowName } from "./genkit-console-rag.ts"; // Replace 'yourFlowName' with the actual name of your flow

// // Define your Cloud Function using onFlow
// export const yourFlowName = onFlow(
//   ai, // Provide the Genkit instance
//   {
//     name: "yourFlowName", // Replace 'yourFlowName' with the actual name of your flow
//     authPolicy: noAuth(), // WARNING: noAuth() creates an open endpoint!
//   },
//   yourFlowName // Pass your flow function as the handler
// );

// // You can add more flows here if needed
// // ...
