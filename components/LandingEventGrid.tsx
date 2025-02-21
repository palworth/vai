// components/LandingEventGrid.tsx
import React from "react";
import { EventGrid } from "@/components/event-grid";
import type { EventCard } from "@/types"; // adjust as needed

interface LandingEventGridProps {
  events: EventCard[];
  className?: string;
}

export function LandingEventGrid({
  events,
  className,
}: LandingEventGridProps) {
  return (
    <div className={`w-full px-4 ${className}`}>
      {/* The "card" container with rounded corners, shadow, and padding */}
      <div className="bg-white rounded-lg shadow p-4 w-full">
        {/* Bold heading with smaller bottom margin (mb-2 instead of mb-4) */}
        <h2 className="text-center text-sm font-bold mb-2">Quick Links</h2>

        {/* Flex wrapper to help center the EventGrid container */}
        <div className="flex justify-center">
          {/* Let the grid fill all available space */}
          <div className="w-full">
            <EventGrid events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}
