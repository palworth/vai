"use client"

import { Search } from "lucide-react"

export function SearchBar() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white z-30 px-4 py-3 border-b shadow-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <textarea
          placeholder="Talk to vetAI"
          className="w-full pl-10 pr-3 py-3 bg-gray-100 border-none rounded-full text-lg resize-none overflow-hidden"
          style={{
            height: "3rem",
            lineHeight: "1.5rem",
            maxHeight: "6rem",
            minHeight: "3rem",
          }}
          onInput={(e) => {
            e.currentTarget.style.height = "3rem"
            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
          }}
        />
      </div>
    </div>
  )
}

