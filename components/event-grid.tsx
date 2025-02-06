import Link from "next/link"
import type { EventCard } from "../types"
import { useRoutes } from "@/hooks/useRoutes"

interface EventGridProps {
  events: EventCard[]
}

export function EventGrid({ events }: EventGridProps) {
  const { getRoute } = useRoutes()

  return (
    <div className="events-grid grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 pt-8">
      {events.map((event) => (
        <Link
          key={event.title}
          href={getRoute(event.href)}
          className="rounded-2xl p-6 flex items-center justify-center h-24 relative overflow-hidden"
          style={{ backgroundColor: event.backgroundColor }}
        >
          {event.decorativeElements}
          <span className="text-white text-xl font-semibold relative z-10">{event.title}</span>
        </Link>
      ))}
    </div>
  )
}

