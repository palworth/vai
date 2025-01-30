// lib/openai.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generates a short message using OpenAI.
 * We use a higher max_tokens (e.g., 100) to reduce mid-sentence truncation.
 */
export async function generateNotificationMessage(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that writes short, personal dog-care notifications.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100,  // increased from 50
      temperature: 0.7,
    })

    const choice = response.choices[0]
    const content = choice?.message?.content ?? 'Default notification message'
    return content.trim()
  } catch (error) {
    console.error('OpenAI error:', error)
    return 'Error generating message'
  }
}
