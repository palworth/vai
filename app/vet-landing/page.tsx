"use client";

import { useState, useEffect, useCallback } from "react";
import { SearchBarButton } from "@/components/search-bar";
import DogSelector, { Dog } from "@/components/DogSelector";
import VetStats from "@/components/event-stats-cards/VetStats";
import VetDocuments from "@/components/vet-documents";
import { FloatingActionButtonVet } from "@/components/floating-action-button-vet";
import { useAuth } from "@/app/contexts/AuthContext";

// Import the events array and the new LandingEventGrid component.
import { events } from "@/constants/navigation";
import { LandingEventGrid } from "@/components/LandingEventGrid";

interface VetEvent {
  id: string;
  eventDate: string; // ISO date string, e.g. "2025-02-19T03:06:31.000Z"
  type: string;      // "vetAppointment" or "vaccinationAppointment"
  dogName?: string;
  data: {
    appointmentType?: string;
    vaccinationsType?: string;
    vetName?: string;
    notes?: string;
    vetDocuments?: string[];
  };
  imageUrls?: string[];
}

export default function VetLandingPage() {
  const { user } = useAuth();
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [vetEvents, setVetEvents] = useState<VetEvent[]>([]);
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
      // Filter for vet-related events.
      const eventsData = data
        .filter((event: any) =>
          event.type === "vetAppointment" || event.type === "vaccinationAppointment"
        )
        .map((event: any) => ({ ...event, data: event.data || {} }));
      setVetEvents(eventsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching all vet events:", error);
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
      // Filter for vet-related events.
      const eventsData = data
        .filter((event: any) =>
          event.type === "vetAppointment" || event.type === "vaccinationAppointment"
        )
        .map((event: any) => ({ ...event, data: event.data || {} }));
      setVetEvents(eventsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vet events by dog:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (selectedDog) {
      fetchVetEventsByDog(selectedDog.id);
    } else {
      fetchAllVetEvents();
    }
  }, [selectedDog, fetchVetEventsByDog, fetchAllVetEvents, user]);

  const refreshEvents = useCallback(() => {
    if (!user) return;
    if (selectedDog) {
      fetchVetEventsByDog(selectedDog.id);
    } else {
      fetchAllVetEvents();
    }
  }, [selectedDog, fetchVetEventsByDog, fetchAllVetEvents, user]);

  // Filter for the bottom event grid: Weight Change, Vet Hub, and Poop Journal.
  const bottomEvents = events.filter((event) =>
    ["Weight Change", "Health", "Poop Journal"].includes(event.title)
  );

  return (
    <div className="p-4">
      <SearchBarButton />
      <h1 className="text-3xl font-bold mt-16 mb-4">Veterinarian Hub</h1>
      <DogSelector onSelect={setSelectedDog} />
      <VetStats events={vetEvents} selectedDog={selectedDog} />
      <VetDocuments events={vetEvents} />
      {loading && <p>Loading vet events...</p>}
      {/* Render the bottom event grid using LandingEventGrid (defaults to 75% scale) */}
      <div className="mt-8 flex justify-center">
        <LandingEventGrid events={bottomEvents} />
      </div>
      <FloatingActionButtonVet dogId={selectedDog?.id} onRefresh={refreshEvents} />
    </div>
  );
}
