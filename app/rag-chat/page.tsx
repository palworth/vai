"use client"

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { collection, query, where, getDocs, doc } from "firebase/firestore";
import { db, functions } from "@/lib/firebase";
import { ChatInterface, Message, Dog } from "@/components/ChatInterface";
import { httpsCallable, connectFunctionsEmulator } from "firebase/functions";

// If in development, connect to the Functions emulator:
// if (process.env.NODE_ENV === "development") {
//   connectFunctionsEmulator(functions, "localhost", 5001);
// }

export default function RagChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [isGeneralChat, setIsGeneralChat] = useState(false);
  const { user } = useAuth();


  // Fetch user's dogs for the dropdown.
  const fetchUserDogs = useCallback(async () => {
    if (!user) return;
    const dogsQuery = query(
      collection(db, "dogs"),
      where("users", "array-contains", doc(db, "users", user.uid))
    );
    const querySnapshot = await getDocs(dogsQuery);
    const dogsData = querySnapshot.docs.map((docSnap) => {
      const data = { ...docSnap.data() } as Record<string, any>;
      delete data.id;
      return { id: docSnap.id, ...data } as Dog;
    });
    setDogs(dogsData);
    if (dogsData.length > 0 && !isGeneralChat) {
      setSelectedDogId(dogsData[0].id);
    }
  }, [user, isGeneralChat]);

  useEffect(() => {
    if (user) {
      fetchUserDogs();
    }
  }, [user, fetchUserDogs]);

  // Updated onSubmit handler that calls the Cloud Function directly.
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() === "" || (!selectedDogId && !isGeneralChat)) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Create a callable reference to the Cloud Function directly.
      const generateDogResponseCallable = httpsCallable(functions, "generateDogResponseFunction");

      const result = await generateDogResponseCallable({
        dogId: isGeneralChat ? null : selectedDogId,
        testQuestion: currentInput,
      });
      
      // Log the response for debugging.
      console.log("Result from Cloud Function:", result.data);
      
      let content: string;
      if (typeof result.data === "string") {
        content = result.data;
      } else if (typeof result.data === "object" && result.data !== null && "result" in result.data) {
        content = (result.data as { result: string }).result;
      } else {
        content = "No valid response received";
      }
      
      const aiMsg: Message = { role: "assistant", content };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Error sending message:", err);
      const errorMsg: Message = {
        role: "assistant",
        content: `Error: ${err instanceof Error ? err.message : "An unknown error occurred"}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const onSelectDog = (dogId: string) => {
    setSelectedDogId(dogId);
  };

  const toggleGeneralChat = () => {
    setIsGeneralChat((prev) => {
      const newVal = !prev;
      if (newVal) {
        setSelectedDogId(null);
      } else if (dogs.length > 0) {
        setSelectedDogId(dogs[0].id);
      }
      return newVal;
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">RAG Chat</h1>
      <ChatInterface
        messages={messages}
        input={input}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
        isLoading={isLoading}
        dogs={dogs}
        selectedDogId={selectedDogId}
        onSelectDog={onSelectDog}
        isGeneralChat={isGeneralChat}
        toggleGeneralChat={toggleGeneralChat}
      />
    </div>
  );
}
