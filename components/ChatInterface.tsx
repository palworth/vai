// components/ChatInterface.tsx
"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AutoResizeTextarea } from "./auto-resize-textarea"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
}

export interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  dogs: Dog[];
  selectedDogId: string | null;
  onSelectDog: (dogId: string) => void;
  isGeneralChat: boolean;
  toggleGeneralChat: () => void;
}

export function ChatInterface(props: ChatInterfaceProps) {
  const {
    messages,
    input,
    onInputChange,
    onSubmit,
    isLoading,
    dogs,
    selectedDogId,
    onSelectDog,
    isGeneralChat,
    toggleGeneralChat,
  } = props

  const router = useRouter() // Use router to navigate back home
  const formContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<{ resetHeight: () => void } | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom()
    }, 100)
    return () => clearTimeout(timer)
  }, [messages])

  return (
    <Card className="w-full h-full flex flex-col bg-gradient-to-b from-purple-500/10 to-navy-900/95 rounded-none border-0">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Button variant="ghost" size="icon">
          {/* More options placeholder */}
          <span className="h-5 w-5">⋮</span>
        </Button>
        <div className="mx-auto">
          <h2 className="text-lg font-semibold">VETai</h2>
        </div>
        {/* X button now navigates to the home page */}
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <span className="h-5 w-5">×</span>
        </Button>
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        {messages.map((message, idx) => (
          <div key={idx} className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={cn("flex flex-col gap-2 max-w-[80%]", message.role === "user" ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "rounded-2xl p-4 whitespace-pre-wrap break-words max-w-full",
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                {message.role === "assistant" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg p-2 bg-gray-200">VETai is typing...</div>
          </div>
        )}
      </div>

      <div
        ref={formContainerRef}
        className="sticky bottom-0 p-4 border-t border-white/10 bg-background/5 backdrop-blur-sm transition-all duration-200 z-10"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <AutoResizeTextarea
            ref={textareaRef}
            value={input}
            onChange={onInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                onSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
              }
            }}
            placeholder="Share your thoughts..."
            className="min-h-[60px] bg-background/50 backdrop-blur"
            maxHeight={200}
            minHeight={60}
          />
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full" variant="secondary">
                  {selectedDogId ? dogs.find((d) => d.id === selectedDogId)?.name : "Select Dog"} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {dogs.map((dog) => (
                  <DropdownMenuItem key={dog.id} onSelect={() => onSelectDog(dog.id)}>
                    {dog.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="w-full" variant="secondary" type="submit" disabled={isLoading || (!selectedDogId && !isGeneralChat)}>
              Send
            </Button>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Switch id="general-chat" checked={isGeneralChat} onCheckedChange={toggleGeneralChat} />
            <Label htmlFor="general-chat">General Chat</Label>
          </div>
        </form>
      </div>
    </Card>
  )
}
