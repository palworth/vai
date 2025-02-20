"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import DogSelector, { Dog } from "@/components/DogSelector";
import PoopJournalStats from "@/components/PoopJournalStats";
import { FloatingActionButton } from "@/components/floating-action-button";

interface PoopJournalEvent {
  id: string;
  eventDate: string;
  type: string;
  data: {
    solidScale?: number;
  };
  imageUrls?: string[];
}

export default function PoopJournalPage() {
  const { user } = useAuth();
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [selectedDogEvents, setSelectedDogEvents] = useState<PoopJournalEvent[]>([]);
  const [hasMultipleDogs, setHasMultipleDogs] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  // State for the modal image URL.
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  // Fetch poop journal events for the selected dog.
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

  // When a dog is selected, fetch its events.
  useEffect(() => {
    if (selectedDog) {
      fetchEventsByDog(selectedDog.id);
    } else {
      setSelectedDogEvents([]);
    }
  }, [selectedDog, fetchEventsByDog]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Poop Journal</h1>
      {/* Dog selector is rendered at the top */}
      <DogSelector onSelect={setSelectedDog} onHasMultipleDogs={setHasMultipleDogs} />

      {selectedDog ? (
        <section className="mb-8">
          {hasMultipleDogs && (
            <h2 className="text-2xl font-semibold mb-2">
              All {selectedDog.name} Poop Journal Entries
            </h2>
          )}
          {/* Render stats above the event list */}
          <PoopJournalStats events={selectedDogEvents} />

          {loading ? (
            <p>Loading dog events...</p>
          ) : selectedDogEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedDogEvents.map((event) => {
                // Format event date to local date/time.
                const localDateTime = new Date(event.eventDate).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                });
                return (
                  <div key={event.id} className="border rounded p-4 shadow">
                    <p>
                      <strong>Date:</strong> {localDateTime}
                    </p>
                    <p>
                      <strong>Solidity Scale:</strong> {event.data?.solidScale}
                    </p>
                    <button
                      onClick={() => {
                        if (event.imageUrls && event.imageUrls.length > 0) {
                          // Open image in a modal within the app.
                          setModalImageUrl(event.imageUrls[0]);
                        } else {
                          alert("No image available");
                        }
                      }}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Click here to see image
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No poop journal entries found for this dog.</p>
          )}
        </section>
      ) : (
        <p>Please select a dog to view its Poop Journal entries.</p>
      )}

      {/* Modal for displaying the image */}
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

      {/* Render the floating action button in the bottom-right corner */}
      <FloatingActionButton />
    </div>
  );
}
