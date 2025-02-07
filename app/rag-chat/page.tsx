"use client"

import { useState, useEffect, useCallback, FormEvent } from "react"
import { useAuth } from "@/app/contexts/AuthContext"
import { 
  Card, CardContent, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { collection, query, where, getDocs, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface Dog {
  id: string
  name: string
  breed: string
  age: number
  weight: number
}

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
    // Remove any duplicate "id" property if present.
    const dogsData = querySnapshot.docs.map((docSnap) => {
      const { id: _ignored, ...data } = docSnap.data() as Record<string, any>
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

  // Send a message using our custom API.
  const sendMessage = async () => {
    if (input.trim() === "" || (!selectedDogId && !isGeneralChat)) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Call our API endpoint to get the assistant's reply.
      // (Replace "/api/chat" with your actual API endpoint when ready.)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
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
      const aiMessage: Message = { role: "assistant", content: data.content }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle between dog-specific chat and general chat.
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chat Window Section */}
        <div className="md:col-span-2">
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Chat with VETai</CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Switch id="general-chat" checked={isGeneralChat} onCheckedChange={toggleGeneralChat} />
                <Label htmlFor="general-chat">General Chat</Label>
              </div>
              {!isGeneralChat && (
                <Select value={selectedDogId || ""} onValueChange={setSelectedDogId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a dog" />
                  </SelectTrigger>
                  <SelectContent>
                    {dogs.map((dog) => (
                      <SelectItem key={dog.id} value={dog.id}>
                        {dog.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardHeader>
            <CardContent className="h-[400px] overflow-y-auto space-y-4">
              {messages.map((message, idx) => (
                <div key={idx} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`rounded-lg p-2 max-w-[70%] ${message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg p-2 bg-gray-200">VETai is typing...</div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <form
                onSubmit={(e: FormEvent) => {
                  e.preventDefault()
                  sendMessage()
                }}
                className="flex w-full space-x-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading || (!selectedDogId && !isGeneralChat)}
                />
                <Button type="submit" disabled={isLoading || (!selectedDogId && !isGeneralChat)}>
                  Send
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
        {/* Sidebar: Display User's Dogs */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Dogs</CardTitle>
            </CardHeader>
            <CardContent>
              {dogs.length > 0 ? (
                dogs.map((dog) => (
                  <div key={dog.id} className="mb-4">
                    <h3 className="font-semibold">{dog.name}</h3>
                    <p>Breed: {dog.breed}</p>
                    <p>Age: {dog.age} years</p>
                    <p>Weight: {dog.weight} lbs</p>
                  </div>
                ))
              ) : (
                <p>No dogs found for your account.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
