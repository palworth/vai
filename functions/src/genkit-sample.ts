// Import the Genkit core libraries and plugins.
import {genkit} from "genkit";
import {vertexAI, gemini15Flash} from "@genkit-ai/vertexai";

console.log("Hello from Genkit sample script!!")

const ai = genkit({
  plugins: [
    vertexAI({location: "us-central1"}),
  ],
});
(async () => {
  try {
    // Construct a prompt
    const prompt = `Suggest an item for the menu of a banana-themed restaurant`;

    // Send the prompt to Gemini 15 Flash model
    const llmResponse = await ai.generate({
      model: gemini15Flash,
      prompt: prompt,
      config: {
        temperature: 1,
      },
    });

    // Print both the prompt and the model's response
    console.log("Prompt:", prompt);
    console.log("Response:", llmResponse.text);
  } catch (error) {
    console.error("Error generating LLM response:", error);
  }
})();