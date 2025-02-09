import { NextResponse } from "next/server";
import { generateDogResponse } from  "@/functions/src/genkit-rag-chat-flow";

export async function POST(request: Request) {
  try {
    const { dogId, testQuestion, isGeneralChat } = await request.json();

    if (isGeneralChat || !dogId) {
      return NextResponse.json({
        content: "General chat functionality not implemented yet.",
      });
    }

    const responseText = await generateDogResponse({ dogId, testQuestion });
    return NextResponse.json({ content: responseText });
  } catch (error: any) {
    console.error("Error in API /rag-chat:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
