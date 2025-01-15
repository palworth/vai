import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  try {
    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: "system",
          content: "You are VETai, an AI assistant specialized in dog veterinary medicine. Provide helpful and accurate information about dog health, but only advise users to consult with a professional veterinarian when it is nessesary."
        },
        ...messages
      ],
    });

    const aiMessage = response.choices[0].message;

    return NextResponse.json({
      content: aiMessage.content,
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: "An error occurred while processing the request" }, { status: 500 });
  }
}

