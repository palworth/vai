// utils/prompts.ts

// Example base prompt templates
export const baseSystemPrompt = `You are a dog-care assistant. Keep messages short, personal, and friendly.`

// For more advanced setups, you could store a map of prompt templates:
export const prompts = {
  dietReminder: (dogName: string) => `Remind the user to update the diet for their dog, ${dogName}.`,
  exerciseReminder: (dogName: string) => `Remind the user about ${dogName}'s exercise routine.`,
  // etc.
}
