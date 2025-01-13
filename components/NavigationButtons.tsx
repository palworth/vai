'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from 'lucide-react'

export function NavigationButtons() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="flex gap-2">
      {pathname !== '/' && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      {pathname !== '/' && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/')}
          aria-label="Go to home page"
        >
          <Home className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

