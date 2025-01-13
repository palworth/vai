'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/signup']

interface AuthWrapperProps {
  children: React.ReactNode
}

/**
 * AuthWrapper Component
 * 
 * This component wraps the application to provide authentication protection.
 * It checks if the user is authenticated and redirects to the login page if not,
 * except for public routes.
 * 
 * @param {React.ReactNode} children - The child components to be rendered if authenticated
 */
export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      // If the user is not authenticated and not on a public route, redirect to login
      router.push('/login')
    }
  }, [user, loading, router, pathname])

  if (loading) {
    // You can replace this with a loading component if desired
    return <div>Loading...</div>
  }

  // If on a public route or authenticated, render the children
  if (publicRoutes.includes(pathname) || user) {
    return <>{children}</>
  }

  // This return is necessary for TypeScript, but it should never be reached
  return null
}

