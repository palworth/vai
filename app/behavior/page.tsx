"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { collection, getDocs, query, where, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import EventSummaryCard from "@/components/EventSummaryCard";
import type { DataItem } from "@/utils/types";

export default function BehaviorEventsPage() {
  const { user } = useAuth();

  // State for all behavior events for the user.
  const [allEvents, setAllEvents] = useState<DataItem[]>([]);
  // State for the list of dogs for this user.
  const [dogs, setDogs] = useState<any[]>([]);
  // State for the events for the selected dog.
  const [selectedDogEvents, setSelectedDogEvents] = useState<DataItem[]>([]);
  // State for the selected dog's id.
  const [selectedDogId, setSelectedDogId] = useState<string>("");

  // Fetch all behavior events for the user.
  const fetchAllEvents = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/behavior-events/data/all_per_user?userId=${user.uid}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      // Map each event and add the type property so it matches our DataItem union.
      const events: DataItem[] = json.behaviorEvents.map((event: any) => ({
        ...event,
        type: "behavior",
      }));
      setAllEvents(events);
    } catch (error) {
      console.error("Error fetching all behavior events:", error);
    }
  }, [user]);

  // Fetch all dogs for the user.
  // Assumes that dogs are stored in "dogs" collection and have a "users" field (an array of DocumentReferences)
  const fetchDogs = useCallback(async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const dogsQuery = query(collection(db, "dogs"), where("users", "array-contains", userRef));
      const querySnapshot = await getDocs(dogsQuery);
      const dogsList = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setDogs(dogsList);
    } catch (error) {
      console.error("Error fetching dogs:", error);
    }
  }, [user]);

  // Fetch behavior events for a specific dog by calling the API route.
  const fetchEventsByDog = useCallback(async (dogId: string) => {
    try {
      const res = await fetch(`/api/behavior-events/data/by_dog?dogId=${dogId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      const events: DataItem[] = json.behaviorEvents.map((event: any) => ({
        ...event,
        type: "behavior",
      }));
      setSelectedDogEvents(events);
    } catch (error) {
      console.error("Error fetching behavior events by dog:", error);
    }
  }, []);

  // On mount, if user exists, fetch all events and dogs.
  useEffect(() => {
    if (user) {
      fetchAllEvents();
      fetchDogs();
    }
  }, [user, fetchAllEvents, fetchDogs]);

  // When a dog is selected, fetch its events.
  const handleDogSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dogId = e.target.value;
    setSelectedDogId(dogId);
    if (dogId) {
      fetchEventsByDog(dogId);
    } else {
      setSelectedDogEvents([]);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Behavior Events</h1>

      {/* Section 1: All events for the user */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">All Behavior Events (Per User)</h2>
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

      {/* Section 2: Dropdown to select a dog */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Filter by Dog</h2>
        <select
          value={selectedDogId}
          onChange={handleDogSelect}
          className="border p-2 rounded"
        >
          <option value="">-- Select a Dog --</option>
          {dogs.map((dog) => (
            <option key={dog.id} value={dog.id}>
              {dog.name}
            </option>
          ))}
        </select>
      </section>

      {/* Section 3: Events for the selected dog */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">
          Behavior Events for Selected Dog
        </h2>
        {selectedDogEvents && selectedDogEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedDogEvents.map((event, index) => (
              <EventSummaryCard key={index} data={event} />
            ))}
          </div>
        ) : (
          <p>Please select a dog to view its events.</p>
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
