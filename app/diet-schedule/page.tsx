"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import  EventSummaryCard  from "@/components/EventSummaryCard";
import type { DataItem } from "@/utils/types";

export default function DietSchedulePage() {
  const { user } = useAuth();
  const [scheduleEvents, setScheduleEvents] = useState<DataItem[]>([]);

  // Fetch all diet schedule events for the user
  const fetchAllScheduleEvents = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/diet-schedule-event/data/all_per_user?userId=${user.uid}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      // Map each event to include type "diet-schedule" so it matches our DataItem union.
      const events: DataItem[] = json.dietScheduleEvents.map((event: any) => ({
        ...event,
        type: "diet-schedule",
      }));
      setScheduleEvents(events);
    } catch (error) {
      console.error("Error fetching diet schedule events:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAllScheduleEvents();
    }
  }, [user, fetchAllScheduleEvents]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Diet Schedule Events</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-2">All Schedule Events</h2>
        {scheduleEvents && scheduleEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scheduleEvents.map((event, index) => (
              <EventSummaryCard key={index} data={event} />
            ))}
          </div>
        ) : (
          <p>No schedule events found.</p>
        )}
      </section>

      <div className="mt-4">
        <Link href="/" className="text-blue-600 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
