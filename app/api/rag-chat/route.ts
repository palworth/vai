import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { dogId, testQuestion, isGeneralChat } = await request.json();

    if (isGeneralChat || !dogId) {
      return NextResponse.json({
        content: "General chat functionality not implemented yet.",
      });
    }

    // Dynamically import only when it's needed
    const { generateDogResponse } = await import(
      "@/functions/src/genkit-rag-chat-flow"
    );

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
