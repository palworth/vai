"use client"

import { cn } from "@/lib/utils"
import React, { useRef, useEffect, type TextareaHTMLAttributes } from "react"

export interface AutoResizeTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
  value: string
  onChange: (value: string) => void
}

export const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Combine forwarded ref with the local ref.
    React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement)

    const resizeTextarea = () => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = "auto"
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }

    useEffect(() => {
      resizeTextarea()
    }, [value])

    return (
      <textarea
        {...props}
        value={value}
        ref={textareaRef}
        rows={1}
        onChange={(e) => {
          onChange(e.target.value)
          resizeTextarea()
        }}
        className={cn("resize-none min-h-4 max-h-80", className)}
      />
    )
  }
)

AutoResizeTextarea.displayName = "AutoResizeTextarea"
