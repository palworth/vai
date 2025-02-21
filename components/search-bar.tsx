"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

export function SearchBarButton() {
  const router = useRouter()

  return (
    <div className="fixed top-0 left-0 right-0 z-30 p-4">
      <Button
        variant="secondary"
        className="w-full h-12 flex items-center justify-start bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full text-lg shadow-lg transition-all duration-300 ease-in-out"
        onClick={() => router.push("/rag-chat")}
      >
        <MessageCircle className="mr-3 text-purple-500 w-5 h-5" />
        Chat with vetAI
      </Button>
    </div>
  )
}

