"use client"

import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"
import { createPortal } from "react-dom"
import type React from "react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (typeof window === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#1C1C1E] rounded-t-xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4">
              <button onClick={onClose} className="p-2">
                <X className="w-6 h-6 text-gray-400" />
              </button>
              <h2 className="text-lg font-semibold text-white">Record {title}</h2>
              <div className="w-10" /> {/* Spacer for alignment */}
            </div>
            <div className="max-h-[80vh] overflow-y-auto pb-8">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}

