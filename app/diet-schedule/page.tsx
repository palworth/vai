"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import EventSummaryCard from "@/components/EventSummaryCard";
import DogSelector, { Dog } from "@/components/DogSelector";
import type { DataItem } from "@/utils/types";

export default function DietSchedulePage() {
  const { user } = useAuth();

  // State for diet schedule events.
  const [scheduleEvents, setScheduleEvents] = useState<DataItem[]>([]);
  // State for the selected dog.
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  // Flag indicating whether the user has multiple dogs.
  const [hasMultipleDogs, setHasMultipleDogs] = useState<boolean>(false);

  // Fetch all diet schedule events for the user.
  const fetchAllScheduleEvents = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/diet-schedule-event/data/all_per_user?userId=${user.uid}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      const events: DataItem[] = json.dietScheduleEvents.map((event: any) => ({
        ...event,
        type: "diet-schedule",
      }));
      setScheduleEvents(events);
    } catch (error) {
      console.error("Error fetching diet schedule events:", error);
    }
  }, [user]);

  // Fetch diet schedule events for a selected dog.
  const fetchEventsByDog = useCallback(async (dogId: string) => {
    try {
      const res = await fetch(`/api/diet-schedule-event/data/by_dog?dogId=${dogId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      const events: DataItem[] = json.dietScheduleEvents.map((event: any) => ({
        ...event,
        type: "diet-schedule",
      }));
      setScheduleEvents(events);
    } catch (error) {
      console.error("Error fetching diet schedule events by dog:", error);
    }
  }, []);

  // Whenever the selected dog changes, fetch the corresponding events.
  useEffect(() => {
    if (selectedDog) {
      fetchEventsByDog(selectedDog.id);
    } else if (user) {
      fetchAllScheduleEvents();
    }
  }, [selectedDog, user, fetchAllScheduleEvents, fetchEventsByDog]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Diet Schedule Events</h1>

      {/* DogSelector handles fetching and selecting dogs */}
      <DogSelector onSelect={setSelectedDog} onHasMultipleDogs={setHasMultipleDogs} />

      <section className="mb-8">
        {selectedDog && hasMultipleDogs && (
          <h2 className="text-2xl font-semibold mb-2">
            All {selectedDog.name} Diet Schedule Events
          </h2>
        )}
        {scheduleEvents && scheduleEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scheduleEvents.map((event, index) => (
              <EventSummaryCard key={index} data={event} />
            ))}
          </div>
        ) : (
          <p>{selectedDog ? "Loading dog schedule events..." : "No schedule events found."}</p>
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
