"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import EventSummaryCard from "@/components/EventSummaryCard";
import DogSelector, { Dog } from "@/components/DogSelector";
import type { DataItem } from "@/utils/types";

export default function DietEventsPage() {
  const { user } = useAuth();

  // State for all diet events for the user.
  const [allEvents, setAllEvents] = useState<DataItem[]>([]);
  // State for diet events for the selected dog.
  const [selectedDogEvents, setSelectedDogEvents] = useState<DataItem[]>([]);
  // State for the selected dog.
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  // Flag indicating whether the user has multiple dogs.
  const [hasMultipleDogs, setHasMultipleDogs] = useState<boolean>(false);

  // Fetch all diet events for the user.
  const fetchAllEvents = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/diet-events/data/all_per_user?userId=${user.uid}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      const events: DataItem[] = json.dietEvents.map((event: any) => ({
        ...event,
        type: "diet",
      }));
      setAllEvents(events);
    } catch (error) {
      console.error("Error fetching all diet events:", error);
    }
  }, [user]);

  // Fetch diet events for a selected dog.
  const fetchEventsByDog = useCallback(async (dogId: string) => {
    try {
      const res = await fetch(`/api/diet-events/data/by_dog?dogId=${dogId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      const events: DataItem[] = json.dietEvents.map((event: any) => ({
        ...event,
        type: "diet",
      }));
      setSelectedDogEvents(events);
    } catch (error) {
      console.error("Error fetching diet events by dog:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAllEvents();
    }
  }, [user, fetchAllEvents]);

  // When a dog is selected via DogSelector, fetch its events.
  useEffect(() => {
    if (selectedDog) {
      fetchEventsByDog(selectedDog.id);
    }
  }, [selectedDog, fetchEventsByDog]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Diet Events</h1>
      
      {/* DogSelector handles fetching and selecting dogs */}
      <DogSelector onSelect={setSelectedDog} onHasMultipleDogs={setHasMultipleDogs} />

      {selectedDog ? (
        <section className="mb-8">
          {hasMultipleDogs && (
            <h2 className="text-2xl font-semibold mb-2">
              All {selectedDog.name} Diet Events
            </h2>
          )}
          {selectedDogEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedDogEvents.map((event, index) => (
                <EventSummaryCard key={index} data={event} />
              ))}
            </div>
          ) : (
            <p>Loading dog events...</p>
          )}
        </section>
      ) : (
        <section className="mb-8">
          {allEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allEvents.map((event, index) => (
                <EventSummaryCard key={index} data={event} />
              ))}
            </div>
          ) : (
            <p>Loading all events...</p>
          )}
        </section>
      )}

      <div className="mt-4">
        <Link href="/" className="text-blue-600 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
