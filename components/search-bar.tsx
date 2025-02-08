"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function SearchBarButton() {
  const router = useRouter()

  return (
    <div className="fixed top-0 left-0 right-0 z-30 px-4 py-3 border-b shadow-sm">
      <Button
        variant="secondary"
        className="w-full h-12 flex items-center justify-start bg-gradient-to-r from-purple-500/10 to-orange-500/10 hover:from-purple-500/20 hover:to-orange-500/20 rounded-full text-lg"
        onClick={() => router.push("/rag-chat")}
      >
        <Search className="mr-3 text-gray-400 w-5 h-5" />
        Talk to vetAI
      </Button>
    </div>
  )
}
