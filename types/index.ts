import type React from "react"

export interface EventCard {
  title: string
  backgroundColor: string
  href: string
  decorativeElements?: React.ReactNode
}

export interface CourseCard {
  title: string
  backgroundColor: string
  secondaryColor?: string
  href: string
  decorativeElements?: React.ReactNode
}

export interface GuidedProgram {
  tag: string
  title: string
  level: string
  duration: string
  weeksCount: number
  minutesPerDay: number
  instructor: {
    name: string
    image: string
  }
}

export interface NavigationItem {
  label: string
  href: string
  icon: React.ReactNode
}

