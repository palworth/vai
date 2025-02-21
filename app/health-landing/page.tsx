"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/contexts/AuthContext"; // Global auth context
import { SearchBarButton } from "@/components/search-bar";
import DogSelector, { Dog } from "@/components/DogSelector";
import VetStats from "@/components/event-stats-cards/VetStats";
import HealthStats from "@/components/event-stats-cards/HealthStats";
import { HealthSummaryCard } from "@/components/event-specific-summary-cards/health-summary-card";
import { FloatingActionButtonVet } from "@/components/fabs/floating-action-button-vet";

// Import the events array and the new LandingEventGrid for the bottom cards.
import { events } from "@/constants/navigation";
import { LandingEventGrid } from "@/components/LandingEventGrid";

interface VetEvent {
  id: string;
  eventDate: string; // ISO date string e.g. "2025-02-19T03:06:31.000Z"
  type: string;      // "vetAppointment" or "vaccinationAppointment"
  dogName?: string;  // Some events may store dog's name at top-level
  data?: {
    appointmentType?: string;
    vaccinationsType?: string;
    vetName?: string;
    notes?: string;
    vetDocuments?: string[];
    dogName?: string;
  };
  imageUrls?: string[];
}

interface HealthEvent {
  id: string;
  eventDate: string;
  type: string; // "health"
  data: {
    eventType?: string;
    notes?: string;
    severity?: number;
  };
  imageUrls?: string[];
}

export default function HealthLandingPage() {
  const { user } = useAuth();
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [vetEvents, setVetEvents] = useState<VetEvent[]>([]);
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAllVetEvents = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(
        `https://us-central1-vai2-80fb0.cloudfunctions.net/getAllEventsForUser?userId=${user.uid}`
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      // Filter for vet-related events only.
      const eventsData = data.filter(
        (event: any) =>
          event.type === "vetAppointment" || event.type === "vaccinationAppointment"
      );
      setVetEvents(eventsData);
    } catch (error) {
      console.error("Error fetching all vet events:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchVetEventsByDog = useCallback(async (dogId: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://us-central1-vai2-80fb0.cloudfunctions.net/getEventsByDog?dogId=${dogId}`
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      // Filter for vet-related events only.
      const eventsData = data.filter(
        (event: any) =>
          event.type === "vetAppointment" || event.type === "vaccinationAppointment"
      );
      setVetEvents(eventsData);
    } catch (error) {
      console.error("Error fetching vet events:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch health events for the selected dog.
  const fetchHealthEventsByDog = useCallback(async (dogId: string) => {
    try {
      const res = await fetch(
        `https://us-central1-vai2-80fb0.cloudfunctions.net/getEventsByDog?dogId=${dogId}`
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      // Filter for health events.
      const filtered = data.filter((event: any) => event.type === "health");
      // Sort descending by eventDate (latest first)
      filtered.sort(
        (a: any, b: any) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      );
      setHealthEvents(filtered);
    } catch (error) {
      console.error("Error fetching health events:", error);
    }
  }, []);

  useEffect(() => {
    if (!user) return; // Only fetch if user is logged in.
    if (selectedDog) {
      fetchVetEventsByDog(selectedDog.id);
      fetchHealthEventsByDog(selectedDog.id);
    } else {
      fetchAllVetEvents();
      // Optionally clear health events if no dog is selected.
      setHealthEvents([]);
    }
  }, [user, selectedDog, fetchVetEventsByDog, fetchAllVetEvents, fetchHealthEventsByDog]);

  const refreshEvents = useCallback(() => {
    if (!user) return;
    if (selectedDog) {
      fetchVetEventsByDog(selectedDog.id);
      fetchHealthEventsByDog(selectedDog.id);
    } else {
      fetchAllVetEvents();
    }
  }, [user, selectedDog, fetchVetEventsByDog, fetchAllVetEvents, fetchHealthEventsByDog]);

  // Filter for the bottom event grid: Weight Change, Vet Hub, and Poop Journal.
  const bottomEvents = events.filter((event) =>
    ["Weight Change", "Vet Hub", "Poop Journal"].includes(event.title)
  );

  return (
    <div className="p-4">
      <SearchBarButton />
      <h1 className="text-3xl font-bold mt-16 mb-4">Health</h1>
      <DogSelector onSelect={setSelectedDog} />
      {selectedDog && <HealthStats dogId={selectedDog.id} />}
      <VetStats events={vetEvents} selectedDog={selectedDog} />
      {loading && <p>Loading events...</p>}
      
      {/* New Health Events Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Health Events</h2>
        {selectedDog ? (
          healthEvents.length > 0 ? (
            healthEvents.map((event) => (
              <HealthSummaryCard
                key={event.id}
                event={event}
                onViewImage={(url) => console.log("View image:", url)}
              />
            ))
          ) : (
            <p>No health events found.</p>
          )
        ) : (
          <p>Please select a dog to view health events.</p>
        )}
      </div>

      {/* Render the bottom event grid using LandingEventGrid (defaults to 75% scale) */}
      <div className="mt-8 flex justify-center">
        <LandingEventGrid events={bottomEvents} />
      </div>
      <FloatingActionButtonVet dogId={selectedDog?.id} onRefresh={refreshEvents} />
    </div>
  );
}
