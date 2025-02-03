import { Home, Search, User } from "lucide-react"
import type { NavigationItem, EventCard, CourseCard, GuidedProgram } from "../types"
import { routes } from "@/config/routes"

export const navigationItems: NavigationItem[] = [
  {
    label: "Today",
    href: "home",
    icon: <Home className="w-6 h-6" />,
  },
  {
    label: "Explore",
    href: "explore",
    icon: <Search className="w-6 h-6" />,
  },
  {
    label: "Katie",
    href: "profile",
    icon: <User className="w-6 h-6" />,
  },
]

export const events: EventCard[] = [
  {
    title: "Behavior",
    backgroundColor: "#C1693C",
    href: "behavior",
  },
  {
    title: "Exercise",
    backgroundColor: "#3B2B75",
    href: "exercise",
  },
  {
    title: "Diet",
    backgroundColor: "#D65B9D",
    href: "diet",
  },
  {
    title: "Wellness",
    backgroundColor: "#2B7CD5",
    href: "wellness",
  },
  {
    title: "Health",
    backgroundColor: "#4CAF50",
    href: "health",
  },
]

export const featuredProgram: GuidedProgram = {
  tag: "Guided Program",
  title: "Managing Stress",
  level: "Beginner level",
  duration: "4 weeks • 10 mins a day",
  weeksCount: 4,
  minutesPerDay: 10,
  instructor: {
    name: "Kessonga",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0%20-%20Explore-ndfwvDAikVydBoCp3mce3gk589v9rs.png",
  },
}

export const courses: CourseCard[] = [
  {
    title: "Beginning Meditation",
    backgroundColor: "#FF7A00",
    secondaryColor: "#FFB800",
    href: routes.courses.meditation,
  },
  {
    title: "Reframe Stress and Relax",
    backgroundColor: "#2B7CD5",
    href: routes.courses.stress,
    decorativeElements: (
      <div className="absolute top-2 right-2">
        <svg viewBox="0 0 24 24" className="w-12 h-12 text-white opacity-50">
          <path
            fill="currentColor"
            d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"
          />
        </svg>
      </div>
    ),
  },
  {
    title: "Anger, Sadness, and Growth",
    backgroundColor: "#FF69B4",
    secondaryColor: "#FF4500",
    href: routes.courses.emotions,
  },
]

