"use client"

import { useState, useEffect, useCallback, FormEvent } from "react"
import { useAuth } from "@/app/contexts/AuthContext"
import { collection, query, where, getDocs, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ChatInterface, Message, Dog } from "@/components/ChatInterface"

export default function RagChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null)
  const [isGeneralChat, setIsGeneralChat] = useState(false)
  const { user } = useAuth()

  
  // Fetch user's dogs for the dropdown.
  const fetchUserDogs = useCallback(async () => {
    if (!user) return
    const dogsQuery = query(
      collection(db, "dogs"),
      where("users", "array-contains", doc(db, "users", user.uid))
    )
    const querySnapshot = await getDocs(dogsQuery)
    const dogsData = querySnapshot.docs.map((docSnap) => {
      // Spread the document data and remove any "id" property from the data.
      const data = { ...docSnap.data() } as Record<string, any>
      delete data.id
      return { id: docSnap.id, ...data } as Dog
    })
    setDogs(dogsData)
    if (dogsData.length > 0 && !isGeneralChat) {
      setSelectedDogId(dogsData[0].id)
    }
  }, [user, isGeneralChat])

  useEffect(() => {
    if (user) {
      fetchUserDogs()
    }
  }, [user, fetchUserDogs])

  // Send message handler.
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() === "" || (!selectedDogId && !isGeneralChat)) return

    const userMsg: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMsg])
    const currentInput = input
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/rag-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testQuestion: currentInput,
          dogId: isGeneralChat ? null : selectedDogId,
          userId: user?.uid,
          isGeneralChat,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get response from API")
      }
      const data = await response.json()
      const aiMsg: Message = { role: "assistant", content: data.content }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error("Error sending message:", err)
      const errorMsg: Message = {
        role: "assistant",
        content: `Error: ${err instanceof Error ? err.message : "An unknown error occurred"}`,
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const onSelectDog = (dogId: string) => {
    setSelectedDogId(dogId)
  }

  const toggleGeneralChat = () => {
    setIsGeneralChat((prev) => {
      const newVal = !prev
      if (newVal) {
        setSelectedDogId(null)
      } else if (dogs.length > 0) {
        setSelectedDogId(dogs[0].id)
      }
      return newVal
    })
  }

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
  )
}
