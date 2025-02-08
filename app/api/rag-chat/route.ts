// app/api/rag-chat/route.ts
import { NextResponse } from "next/server";
import { generateDogResponse } from "@/functions/src/genkit-rag-chat-flow";
console.log("firebaseAdmin.ts is being loaded");


export async function POST(request: Request) {
  try {
    // Expecting dogId, testQuestion, and isGeneralChat in the request body.
    const { dogId, testQuestion, isGeneralChat } = await request.json();

    // For now, if general chat is enabled or dogId is missing, return a stub response.
    if (isGeneralChat || !dogId) {
      return NextResponse.json({ content: "General chat functionality not implemented yet." });
    }

    // Generate the response using our shared functionality.
    const responseText = await generateDogResponse({ dogId, testQuestion });
    return NextResponse.json({ content: responseText });
  } catch (error: any) {
    console.error("Error in API /rag-chat:", error);
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
//