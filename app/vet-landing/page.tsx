"use client";

import { useState, useEffect, useCallback } from "react";
import { SearchBarButton } from "@/components/search-bar";
import DogSelector, { Dog } from "@/components/DogSelector";
import VetStats from "@/components/VetStats";
import VetDocuments from "@/components/vet-documents";
import { FloatingActionButtonVet } from "@/components/floating-action-button-vet";

interface VetEvent {
  id: string;
  eventDate: string; // ISO date string e.g. "2025-02-19T03:06:31.000Z"
  type: string; // "vetAppointment" or "vaccinationAppointment"
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
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [vetEvents, setVetEvents] = useState<VetEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
      const events = data.filter((event: any) =>
        event.type === "vetAppointment" || event.type === "vaccinationAppointment"
      ).map((event: any) => ({ ...event, data: event.data || {} }));
      setVetEvents(events);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vet events:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDog) {
      fetchVetEventsByDog(selectedDog.id);
    } else {
      setVetEvents([]);
    }
  }, [selectedDog, fetchVetEventsByDog]);

  // Refresh callback to re-fetch the vet events without reloading the page.
  const refreshEvents = useCallback(() => {
    if (selectedDog) {
      fetchVetEventsByDog(selectedDog.id);
    }
  }, [selectedDog, fetchVetEventsByDog]);

  return (
    <div className="p-4">
      {/* Top Search Bar */}
      <SearchBarButton />

      {/* Heading anchored below the search bar */}
      <h1 className="text-3xl font-bold mt-16 mb-4">Veterinarian Hub</h1>

      {/* Dog Selector */}
      <DogSelector onSelect={setSelectedDog} />

      {/* Vet Stats */}
      <VetStats events={vetEvents} />

      {/* Vet Documents */}
      <VetDocuments events={vetEvents} />

      {loading && <p>Loading vet events...</p>}

      {/* Floating Action Button specific to vet landing.
          Pass the selected dog's id and the refresh callback so that upon success,
          the events query is re-run.
      */}
      <FloatingActionButtonVet dogId={selectedDog?.id} onRefresh={refreshEvents} />
    </div>
  );
}
