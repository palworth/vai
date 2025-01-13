import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface UseLogoutResult {
  handleLogout: () => Promise<void>
  isLoggedOut: boolean
  showToast: (title: string, description: string, isError?: boolean) => void
  toastOpen: boolean
  setToastOpen: (open: boolean) => void
  toastMessage: { title: string; description: string; isError: boolean }
}

export function useLogout(): UseLogoutResult {
  const [isLoggedOut, setIsLoggedOut] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', isError: false })
  const { signOut } = useAuth()
  const router = useRouter()

  const showToast = (title: string, description: string, isError: boolean = false) => {
    setToastMessage({ title, description, isError })
    setToastOpen(true)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      showToast("Logged out successfully", "You have been logged out of your account.")
      setIsLoggedOut(true)
    } catch (error) {
      console.error('Error signing out:', error)
      showToast("Error", "There was a problem logging out. Please try again.", true)
    }
  }

  useEffect(() => {
    if (isLoggedOut) {
      router.push('/login')
    }
  }, [isLoggedOut, router])

  return {
    handleLogout,
    isLoggedOut,
    showToast,
    toastOpen,
    setToastOpen,
    toastMessage
  }
}

