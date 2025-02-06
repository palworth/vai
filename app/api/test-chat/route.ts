import { NextResponse } from "next/server";
import { dogVetChatFlow } from "../../../functions/src/genkit-first-flow";

export async function POST(request: Request) {
  try {
    // Extract the request payload.
    const { message, dogId } = await request.json();
    if (!message || !dogId) {
      return NextResponse.json(
        { error: "Missing message or dogId" },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      console.warn("Authorization header missing; the flow's auth policy may fail.");
    }

    // Call the Genkit flow with an input object and a context.
    const response = await dogVetChatFlow(
      { question: message, dogId },
      { headers: { authorization: authHeader } }
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in /api/test-chat:", error);
    return NextResponse.json({ error: "Error generating response" }, { status: 500 });
  }
}
