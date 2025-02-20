"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/contexts/AuthContext"; // If you have a global auth context
import { SearchBarButton } from "@/components/search-bar";
import DogSelector, { Dog } from "@/components/DogSelector";
import VetStats from "@/components/VetStats";
import HealthStats from "@/components/HealthStats";
import { FloatingActionButtonVet } from "@/components/floating-action-button-vet";

// Example shape of a VetEvent
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
    dogName?: string; // Some events might store the dog's name in data
  };
  imageUrls?: string[];
}

export default function HealthLandingPage() {
  const { user } = useAuth(); // If you have a user from AuthContext
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [vetEvents, setVetEvents] = useState<VetEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Fetch all vet events for the current user (all dogs).
   * Replace the URL with the real endpoint that returns events for all dogs of the user.
   */
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
      // Filter for vet-related events only
      const events = data.filter(
        (event: any) =>
          event.type === "vetAppointment" || event.type === "vaccinationAppointment"
      );
      setVetEvents(events);
    } catch (error) {
      console.error("Error fetching all vet events:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Fetch vet events for a specific dog ID.
   */
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
      // Filter for vet-related events only
      const events = data.filter(
        (event: any) =>
          event.type === "vetAppointment" || event.type === "vaccinationAppointment"
      );
      setVetEvents(events);
    } catch (error) {
      console.error("Error fetching vet events:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * On mount or when the selected dog changes:
   * - If no dog is selected => fetch all user's events
   * - If a dog is selected => fetch that dog's events
   */
  useEffect(() => {
    if (!user) return; // Only fetch if user is logged in
    if (selectedDog) {
      fetchVetEventsByDog(selectedDog.id);
    } else {
      fetchAllVetEvents();
    }
  }, [user, selectedDog, fetchVetEventsByDog, fetchAllVetEvents]);

  /**
   * Refresh callback to re-fetch the events without reloading the page.
   * - If a dog is selected, re-fetch that dog's events
   * - Otherwise, re-fetch all user's events
   */
  const refreshEvents = useCallback(() => {
    if (!user) return;
    if (selectedDog) {
      fetchVetEventsByDog(selectedDog.id);
    } else {
      fetchAllVetEvents();
    }
  }, [user, selectedDog, fetchVetEventsByDog, fetchAllVetEvents]);

  return (
    <div className="p-4">
      {/* Top Search Bar */}
      <SearchBarButton />

      {/* Heading anchored below the search bar */}
      <h1 className="text-3xl font-bold mt-16 mb-4">Health</h1>

      {/* Dog Selector */}
      <DogSelector onSelect={setSelectedDog} />

      {/* Health Stats (latest health event) - only shows if a single dog is selected */}
      {selectedDog && <HealthStats dogId={selectedDog.id} />}

      {/* Vet Stats - show next vet/vaccination appt. 
          We'll pass selectedDog so VetStats can decide if it should display the dog's name 
          or not. */}
      <VetStats events={vetEvents} selectedDog={selectedDog} />

      {loading && <p>Loading events...</p>}

      {/* Floating Action Button specific to this landing.
          Pass the selected dog's id and the refresh callback so that upon success,
          the events query is re-run.
      */}
      <FloatingActionButtonVet dogId={selectedDog?.id} onRefresh={refreshEvents} />
    </div>
  );
}
