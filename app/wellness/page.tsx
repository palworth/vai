"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { collection, getDocs, query, where, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function WellnessEventsPage() {
  const { user } = useAuth();
  const [allEvents, setAllEvents] = useState<any>(null);
  const [dogs, setDogs] = useState<any[]>([]);
  const [selectedDogEvents, setSelectedDogEvents] = useState<any>(null);
  const [selectedDogId, setSelectedDogId] = useState<string>("");

  // Fetch all wellness events for the user.
  // (Assumes you have an API route for all per user at /api/wellness-events/data/all_per_user)
  const fetchAllEvents = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `/api/wellness-events/data/all_per_user?userId=${user.uid}`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setAllEvents(json.wellnessEvents);
    } catch (error) {
      console.error("Error fetching all wellness events:", error);
    }
  }, [user]);

  // Fetch all dogs for the user.
  // Assumes that in Firestore, the "dogs" collection has a "users" field (an array of DocumentReferences)
  // containing the current user’s reference.
  const fetchDogs = useCallback(async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const dogsQuery = query(
        collection(db, "dogs"),
        where("users", "array-contains", userRef)
      );
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

  // Fetch wellness events for a selected dog.
  const fetchEventsByDog = useCallback(async (dogId: string) => {
    try {
      const res = await fetch(`/api/wellness-events/data/by_dog?dogId=${dogId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setSelectedDogEvents(json.wellnessEvents);
    } catch (error) {
      console.error("Error fetching wellness events by dog:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAllEvents();
      fetchDogs();
    }
  }, [user, fetchAllEvents, fetchDogs]);

  const handleDogSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dogId = e.target.value;
    setSelectedDogId(dogId);
    if (dogId) {
      fetchEventsByDog(dogId);
    } else {
      setSelectedDogEvents(null);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Wellness Events</h1>

      {/* Section 1: All wellness events for the user */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          All Wellness Events (Per User)
        </h2>
        {allEvents ? (
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(allEvents, null, 2)}
          </pre>
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

      {/* Section 3: Wellness events for the selected dog */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">
          Wellness Events for Selected Dog
        </h2>
        {selectedDogEvents ? (
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(selectedDogEvents, null, 2)}
          </pre>
        ) : (
          <p>Please select a dog to view its wellness events.</p>
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
