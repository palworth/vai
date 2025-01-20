"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/app/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { collection, query, where, getDocs, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface Dog {
  id: string
  name: string
}

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null)
  const [isGeneralChat, setIsGeneralChat] = useState(false)
  const { user } = useAuth()

  const fetchUserDogs = useCallback(async () => {
    if (!user) return
    const dogsQuery = query(collection(db, "dogs"), where("users", "array-contains", doc(db, "users", user.uid)))
    const querySnapshot = await getDocs(dogsQuery)
    const dogsData = querySnapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name }))
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

  const sendMessage = async () => {
    if (input.trim() === "" || (!selectedDogId && !isGeneralChat)) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput("")
    setIsLoading(true)

    try {
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
      setMessages((prevMessages) => [...prevMessages, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`,
      }
      setMessages((prevMessages) => [...prevMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleGeneralChat = () => {
    setIsGeneralChat(!isGeneralChat)
    if (!isGeneralChat) {
      setSelectedDogId(null)
    } else if (dogs.length > 0) {
      setSelectedDogId(dogs[0].id)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Chat with VETai</CardTitle>
        <div className="flex items-center space-x-2">
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
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`rounded-lg p-2 max-w-[70%] ${message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
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
          onSubmit={(e) => {
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
  )
}

