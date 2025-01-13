'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function VetAIChatForm() {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([])
  const [inputMessage, setInputMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      setMessages([...messages, { text: inputMessage, isUser: true }])
      // Here you would typically send the message to your AI service and get a response
      // For now, we'll just simulate a response
      setTimeout(() => {
        setMessages(prev => [...prev, { text: "I'm VetAI. How can I help you today?", isUser: false }])
      }, 1000)
      setInputMessage('')
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Chat with VetAI</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          {messages.map((message, index) => (
            <div key={index} className={`p-2 rounded-lg ${message.isUser ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`} style={{maxWidth: '80%'}}>
              {message.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input 
            value={inputMessage} 
            onChange={(e) => setInputMessage(e.target.value)} 
            placeholder="Type your message here..."
          />
          <Button type="submit">Send</Button>
        </form>
      </CardContent>
    </Card>
  )
}

