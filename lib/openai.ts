// lib/openai.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generates a short notification message using OpenAI.
 * Logging the prompt so you can see exactly what is sent.
 */
export async function generateNotificationMessage(prompt: string): Promise<string> {
  try {
    console.log('[OpenAI] Prompt:', prompt) // <--- Logging the prompt for debugging

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          // SYSTEM role ensures the model follows our instructions about style & content
          role: 'system',
          content: `You are writing a direct user-facing dog-care notification. 
            Do not include phrases like "Of course!" or "Here's a short reminder for you." 
            Only provide the final text that the user should see.`
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    })

    const choice = response.choices[0]
    const content = choice.message?.content ?? 'Default notification message'
    return content.trim()
  } catch (error) {
    console.error('OpenAI error:', error)
    return 'Error generating message'
  }
}
