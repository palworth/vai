"use client"

import * as React from "react"
import type { TextareaProps } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface AutoResizeTextareaProps extends Omit<TextareaProps, "value" | "onChange"> {
  value: string
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  maxHeight?: number
  minHeight?: number
}

export const AutoResizeTextarea = React.forwardRef<{ resetHeight: () => void }, AutoResizeTextareaProps>(
  ({ value, onChange, maxHeight = 200, minHeight = 60, className, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    // Update the adjustHeight callback to run on input events
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (!textarea) return

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto"

      // Calculate new height
      const newHeight = Math.max(Math.min(textarea.scrollHeight, maxHeight), minHeight)

      // Set the new height
      textarea.style.height = `${newHeight}px`
    }, [maxHeight, minHeight])

    const resetHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (textarea) {
        // Force immediate height reset
        textarea.style.height = `${minHeight}px`
        textarea.style.overflow = "hidden"

        // Use RAF to ensure the reset happens immediately
        requestAnimationFrame(() => {
          textarea.style.height = `${minHeight}px`
          textarea.style.overflow = "auto"
        })
      }
    }, [minHeight])

    React.useImperativeHandle(
      ref,
      () => ({
        resetHeight,
      }),
      [resetHeight],
    )

    // Adjust height when value changes
    React.useEffect(() => {
      if (!value) {
        resetHeight()
      } else {
        adjustHeight()
      }
    }, [value, adjustHeight, resetHeight])

    // Adjust height on window resize
    React.useEffect(() => {
      window.addEventListener("resize", adjustHeight)
      return () => window.removeEventListener("resize", adjustHeight)
    }, [adjustHeight])

    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onInput={() => {
          // Immediately adjust height on input
          requestAnimationFrame(adjustHeight)
        }}
        rows={1}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed",
          "disabled:opacity-50 resize-none overflow-y-auto transition-all duration-200",
          className,
        )}
        style={{
          minHeight: `${minHeight}px`,
          height: minHeight,
        }}
        {...props}
      />
    )
  }
)

AutoResizeTextarea.displayName = "AutoResizeTextarea"
