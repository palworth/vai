"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { db } from "@/lib/firebase"; // your Firestore client instance
import { collection, query, where, getDocs, doc } from "firebase/firestore";

type ChatEntry = {
  sender: "User" | "Bot";
  message: string;
};

export default function TestChatPage() {
  const { user } = useAuth(); // user is of type firebase.User
  const [dogs, setDogs] = useState<any[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string>("");
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch the list of dogs associated with the authenticated user.
  const fetchDogs = useCallback(async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const dogsQuery = query(
        collection(db, "dogs"),
        where("users", "array-contains", userRef)
      );
      const querySnapshot = await getDocs(dogsQuery);
      const dogsList = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setDogs(dogsList);
    } catch (error) {
      console.error("Error fetching dogs:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDogs();
    }
  }, [user, fetchDogs]);

  const handleDogSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDogId(e.target.value);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !user || !selectedDogId) return;

    // Append the user's message to the chat history.
    const newHistory: ChatEntry[] = [
      ...chatHistory,
      { sender: "User", message: input },
    ];
    setChatHistory(newHistory);
    const messageToSend = input;
    setInput("");
    setLoading(true);

    try {
      // Retrieve the token using user.getIdToken()
      const token = await user.getIdToken();
      // Pass the Firebase ID token via the Authorization header.
      console.log(`Bearer ${token}`)
      const res = await fetch("/api/test-chat", {
        method: "POST",
       
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageToSend,
          userId: user.uid,
          dogId: selectedDogId,
        }),
      });
      const data = await res.json();
      setChatHistory([
        ...newHistory,
        { sender: "Bot", message: data.response || "No response" },
      ]);
    } catch (error) {
      console.error("Error generating response:", error);
      setChatHistory([
        ...newHistory,
        { sender: "Bot", message: "Sorry, an error occurred." },
      ]);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: "20px",
        boxSizing: "border-box",
        paddingBottom: "80px", // extra space for a bottom nav bar if present
      }}
    >
      <h1>Dog Vet Chatbot</h1>
      
      {/* Dog selection dropdown */}
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="dog-select" style={{ marginRight: "10px" }}>
          Select Your Dog:
        </label>
        <select
          id="dog-select"
          value={selectedDogId}
          onChange={handleDogSelect}
          className="border p-2 rounded"
        >
          <option value="">-- Select a Dog --</option>
          {dogs.map((dog) => (
            <option key={dog.id} value={dog.id}>
              {dog.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Chat history */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {chatHistory.map((entry, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <strong>{entry.sender}: </strong>
            <span>{entry.message}</span>
          </div>
        ))}
        {loading && <p>Loading response...</p>}
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSend} style={{ display: "flex" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            fontSize: "16px",
            border: "1px solid #ccc",
          }}
          placeholder="Type your message..."
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            marginLeft: "10px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
