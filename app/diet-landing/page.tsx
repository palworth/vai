"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import DogSelector, { Dog } from "@/components/DogSelector";
import { FloatingActionButtonPoop } from "@/components/floating-action-button-poop";
import { DietExceptionSummaryCard, DietExceptionEvent } from "@/components/event-specific-summary-cards/diet-exception-summary-card";
import { DietScheduleCardNew } from "@/components/event-specific-summary-cards/diet-schedule-card-new";
import { events } from "@/constants/navigation";
import { LandingEventGrid } from "@/components/LandingEventGrid";

interface DietScheduleData {
  id: string;
  eventDate: string;
  scheduleName: string;
  feedingTimes: ("morning" | "evening" | "all day")[];
  foodType: string;
  brandName: string;
  quantity: number;
  dogName?: string;
  dogImageUrl?: string;
  breed: string;
  type: "diet-schedule";
}

export default function DietLandingPage() {
  const { user } = useAuth();
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [dietScheduleData, setDietScheduleData] = useState<DietScheduleData | null>(null);
  const [selectedDogEvents, setSelectedDogEvents] = useState<DietExceptionEvent[]>([]);
  const [hasMultipleDogs, setHasMultipleDogs] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState<number>(0);

  // Fetch the diet schedule event using the new endpoint.
  const fetchDietScheduleByDog = useCallback(async (dogId: string) => {
    try {
      const res = await fetch(
        `https://us-central1-vai2-80fb0.cloudfunctions.net/getEventsByDog?dogId=${dogId}&type=dietSchedule`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      // Assume the API returns an array of diet schedule events; we pick the first (most recent).
      if (json && json.length > 0) {
        setDietScheduleData(json[0]);
        console.log(json[0])
      } else {
        setDietScheduleData(null);
      }
    } catch (error) {
      console.error("Error fetching diet schedule for dog:", error);
    }
  }, []);

  // Fetch diet exception events for the selected dog.
  const fetchDietExceptionEventsByDog = useCallback(async (dogId: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://us-central1-vai2-80fb0.cloudfunctions.net/getEventsByDog?dogId=${dogId}&type=dietException`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      const events: DietExceptionEvent[] = json.map((event: any) => ({
        ...event,
        type: "dietException",
      }));
      setSelectedDogEvents(events);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching diet exception events for dog:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDog) {
      fetchDietScheduleByDog(selectedDog.id);
      fetchDietExceptionEventsByDog(selectedDog.id);
    } else {
      setDietScheduleData(null);
      setSelectedDogEvents([]);
    }
  }, [selectedDog, fetchDietScheduleByDog, fetchDietExceptionEventsByDog, refreshCount]);

  const refreshEvents = () => {
    setRefreshCount((prev) => prev + 1);
  };

  // Bottom event grid: Diet Schedule and Health cards.
  const bottomEvents = events.filter((event) =>
    ["Diet Schedule", "Health"].includes(event.title)
  );

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Diet</h1>
      <DogSelector onSelect={setSelectedDog} onHasMultipleDogs={setHasMultipleDogs} />

      {selectedDog ? (
        <section className="mb-8">
          {/* Render the Diet Schedule card (using DietScheduleCardNew) above the diet exception entries */}
          {dietScheduleData ? (
            <div className="mb-4">
              <DietScheduleCardNew data={dietScheduleData} />
            </div>
          ) : (
            <p>No diet schedule found for this dog.</p>
          )}

          {hasMultipleDogs && (
            <h2 className="text-2xl font-semibold mb-2">
              All {selectedDog.name} Diet Exception Entries
            </h2>
          )}

          {loading ? (
            <p>Loading dog events...</p>
          ) : selectedDogEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {selectedDogEvents.map((event) => (
                <DietExceptionSummaryCard
                  key={event.id}
                  event={event}
                  onViewImage={(url) => setModalImageUrl(url)}
                />
              ))}
            </div>
          ) : (
            <p>No diet exception entries found for this dog.</p>
          )}
        </section>
      ) : (
        <p>Please select a dog to view its diet schedule and exceptions.</p>
      )}

      {modalImageUrl && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setModalImageUrl(null)}
        >
          <div
            className="bg-white p-4 rounded shadow-lg max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={modalImageUrl} alt="Diet Exception" className="max-w-full max-h-full" />
            <button
              onClick={() => setModalImageUrl(null)}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bottom event grid for Diet Schedule and Health using LandingEventGrid */}
      <div className="mt-8 flex justify-center">
        <LandingEventGrid events={bottomEvents} />
      </div>

      <FloatingActionButtonPoop dogId={selectedDog?.id} onRefresh={refreshEvents} />
    </div>
  );
}
