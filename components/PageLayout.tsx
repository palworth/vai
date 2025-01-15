'use client'

import { usePathname } from 'next/navigation'
import { PageHeader } from './PageHeader'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Settings } from 'lucide-react'

interface PageLayoutProps {
  children: React.ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login' || pathname === '/signup'

  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return 'VetAI'
      case '/vetai-chat':
        return 'Talk to VetAI'
      case '/health-wellness':
        return 'Health & Wellness'
      case '/diet-exercise':
        return 'Diet & Exercise'
      case '/behavior':
        return 'Behavior'
      case '/dogs':
        return 'My Dogs'
      case '/dogs/add':
        return 'Add New Dog'
      case '/settings':
        return 'Settings'
      default:
        if (pathname.startsWith('/dogs/')) {
          return 'Dog Details'
        }
        return 'VetAI'
    }
  }

  const getRightContent = () => {
    switch (pathname) {
      case '/':
        return (
          <Link href="/settings">
            <Settings className="h-6 w-6 text-gray-500 hover:text-gray-700" />
          </Link>
        )
      case '/dogs':
        return (
          <Link href="/dogs/add">
            <Button>Add New Dog</Button>
          </Link>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {!isLoginPage && (
        <PageHeader 
          title={getPageTitle()} 
          rightContent={getRightContent()}
        />
      )}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

