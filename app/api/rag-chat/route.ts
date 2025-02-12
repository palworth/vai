// app/api/rag-chat/route.ts
import { NextResponse } from "next/server";
import { functions } from "@/lib/firebase";
import { connectFunctionsEmulator, httpsCallable } from "firebase/functions";

// If in development, connect to the Functions emulator:
if (process.env.NODE_ENV === "development") {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

export async function POST(request: Request) {
  try {
    const { dogId, testQuestion, isGeneralChat } = await request.json();

    if (isGeneralChat || !dogId) {
      return NextResponse.json({
        content: "General chat functionality not implemented yet.",
      });
    }

    const generateDogResponseCallable = httpsCallable(functions, "generateDogResponseFunction");
    const result = await generateDogResponseCallable({ dogId, testQuestion });
    
    // Log the full result object to inspect its structure
    console.log("Full result object from Cloud Function:", result);
    
    // Try logging result.data explicitly
    console.log("Result data from Cloud Function:", result.data);
    
    // Check if result.data is a string or an object with a key "result"
    let content: string;
    if (typeof result.data === "string") {
      content = result.data;
    } else if (typeof result.data === "object" && result.data !== null && "result" in result.data) {
      content = (result.data as { result: string }).result;
    } else {
      content = "No valid response received";
    }
    
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Error in API /rag-chat:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
