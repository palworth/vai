"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import DogSelector, { Dog } from "@/components/DogSelector";
import PoopJournalStats from "@/components/PoopJournalStats";
import { FloatingActionButtonPoop } from "@/components/floating-action-button-poop";
import { PoopJournalSummaryCard, PoopJournalEvent } from "@/components/poop-journal-summary-card";
// New imports for Health and Vet Hub cards.
import { events } from "@/constants/navigation";
// Use the new LandingEventGrid component
import { LandingEventGrid } from "@/components/LandingEventGrid";

export default function PoopJournalPage() {
  const { user } = useAuth();
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [selectedDogEvents, setSelectedDogEvents] = useState<PoopJournalEvent[]>([]);
  const [hasMultipleDogs, setHasMultipleDogs] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState<number>(0);

  const fetchEventsByDog = useCallback(async (dogId: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://us-central1-vai2-80fb0.cloudfunctions.net/getEventsByDog?dogId=${dogId}&type=poopJournal`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      const events: PoopJournalEvent[] = json.map((event: any) => ({
        ...event,
        type: "poopJournal",
      }));
      setSelectedDogEvents(events);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching poop journal events for dog:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDog) {
      fetchEventsByDog(selectedDog.id);
    } else {
      setSelectedDogEvents([]);
    }
  }, [selectedDog, fetchEventsByDog, refreshCount]);

  const refreshEvents = () => {
    setRefreshCount((prev) => prev + 1);
  };

  // Filter for the bottom event grid: Health and Vet Hub cards.
  const bottomEvents = events.filter((event) =>
    ["Health", "Vet Hub"].includes(event.title)
  );

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Poop Journal</h1>
      <DogSelector onSelect={setSelectedDog} onHasMultipleDogs={setHasMultipleDogs} />

      {selectedDog ? (
        <section className="mb-8">
          {hasMultipleDogs && (
            <h2 className="text-2xl font-semibold mb-2">
              All {selectedDog.name} Poop Journal Entries
            </h2>
          )}
          <PoopJournalStats events={selectedDogEvents} />

          {loading ? (
            <p>Loading dog events...</p>
          ) : selectedDogEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {selectedDogEvents.map((event) => (
                <PoopJournalSummaryCard
                  key={event.id}
                  event={event}
                  onViewImage={(url) => setModalImageUrl(url)}
                />
              ))}
            </div>
          ) : (
            <p>No poop journal entries found for this dog.</p>
          )}
        </section>
      ) : (
        <p>Please select a dog to view its Poop Journal entries.</p>
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
            <img src={modalImageUrl} alt="Poop Journal" className="max-w-full max-h-full" />
            <button
              onClick={() => setModalImageUrl(null)}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bottom event grid for Health and Vet Hub using LandingEventGrid (defaults to 75% scale) */}
      <div className="mt-8 flex justify-center">
        <LandingEventGrid events={bottomEvents} />
      </div>

      <FloatingActionButtonPoop dogId={selectedDog?.id} onRefresh={refreshEvents} />
    </div>
  );
}
