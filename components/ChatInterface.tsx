"use client"

import { useRef, useEffect, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AutoResizeTextarea } from "./auto-resize-textarea"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

export interface Message {
  id?: string
  role: "user" | "assistant"
  content: string
}

export interface Dog {
  id: string
  name: string
  breed: string
  age: number
  weight: number
}

export interface ChatInterfaceProps {
  messages: Message[]
  input: string
  onInputChange: (value: string) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  dogs: Dog[]
  selectedDogId: string | null
  onSelectDog: (dogId: string) => void
  isGeneralChat: boolean
  toggleGeneralChat: () => void
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

  const router = useRouter()
  const formContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom helper
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  // Auto-scroll on new messages
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom()
    }, 100)
    return () => clearTimeout(timer)
  }, [messages])

  return (
    <Card className="w-full h-full flex flex-col bg-gradient-to-b from-purple-500/10 to-navy-900/95 rounded-none border-0">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-white/10">
        {/* Left side: 3-dot (options) button + dog selector */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <span className="h-5 w-5">⋮</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem className="flex items-center space-x-2">
                <Switch
                  id="general-chat"
                  checked={isGeneralChat}
                  onCheckedChange={toggleGeneralChat}
                />
                <Label htmlFor="general-chat">General Chat</Label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex-none" variant="secondary">
                {selectedDogId
                  ? dogs.find((d) => d.id === selectedDogId)?.name
                  : "Select Dog"}{" "}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {dogs.map((dog) => (
                <DropdownMenuItem
                  key={dog.id}
                  onSelect={() => onSelectDog(dog.id)}
                >
                  {dog.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center: VETai heading */}
        <div className="flex-1 text-center">
          <h2 className="text-lg font-semibold">VETai</h2>
        </div>

        {/* Right side: X button */}
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <span className="h-5 w-5">×</span>
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={cn(
              "flex gap-2",
              message.role === "user" ? "flex-row-reverse" : ""
            )}
          >
            <div
              className={cn(
                "flex flex-col gap-2 max-w-[80%]",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              {/* Ternary: user => white background, assistant => off-gray */}
              <div
                className={cn(
                  "rounded-2xl p-4 whitespace-pre-wrap break-words max-w-full text-black",
                  message.role === "user" ? "bg-white" : "bg-gray-100"
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
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-2 bg-gray-200">VETai is typing...</div>
            {/* Spinning loader icon */}
            <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Input Form */}
      <div
        ref={formContainerRef}
        className="sticky bottom-0 w-full border-t border-white/10 bg-background/5 backdrop-blur-sm z-10"
      >
        <form
          onSubmit={onSubmit}
          className="mx-6 mt-3 flex items-center border-input bg-background
                     focus-within:ring-ring/10 relative rounded-[16px] border
                     px-3 py-1.5 pr-3 text-sm focus-within:outline-none
                     focus-within:ring-2 focus-within:ring-offset-0"
        >
          <AutoResizeTextarea
            ref={textareaRef}
            value={input}
            onChange={onInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                onSubmit(e as unknown as FormEvent<HTMLFormElement>)
              }
            }}
            placeholder="Share your thoughts..."
            className="flex-1 min-h-[40px] bg-transparent mx-2"
          />

          <Button
            className="flex-none"
            variant="secondary"
            type="submit"
            disabled={isLoading || (!selectedDogId && !isGeneralChat)}
          >
            Send
          </Button>
        </form>
      </div>
    </Card>
  )
}
