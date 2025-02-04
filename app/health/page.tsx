"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { collection, getDocs, query, where, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function HealthEventsPage() {
  const { user } = useAuth();
  const [allEvents, setAllEvents] = useState<any>(null);
  const [dogs, setDogs] = useState<any[]>([]);
  const [selectedDogEvents, setSelectedDogEvents] = useState<any>(null);
  const [selectedDogId, setSelectedDogId] = useState<string>("");

  // Fetch all health events for the user.
  const fetchAllEvents = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/health-events/data/all_per_user?userId=${user.uid}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setAllEvents(json.healthEvents);
    } catch (error) {
      console.error("Error fetching all health events:", error);
    }
  }, [user]);

  // Fetch all dogs for the user.
  // Assumes dogs are stored in "dogs" collection and have a field "users" that is an array containing the user's reference.
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

  // Fetch health events for a selected dog.
  const fetchEventsByDog = useCallback(async (dogId: string) => {
    try {
      const res = await fetch(`/api/health-events/data/by_dog?dogId=${dogId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setSelectedDogEvents(json.healthEvents);
    } catch (error) {
      console.error("Error fetching health events by dog:", error);
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
      <h1 className="text-3xl font-bold mb-4">Health Events</h1>

      {/* Section 1: All health events for the user */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">All Health Events (Per User)</h2>
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

      {/* Section 3: Health events for the selected dog */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">
          Health Events for Selected Dog
        </h2>
        {selectedDogEvents ? (
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(selectedDogEvents, null, 2)}
          </pre>
        ) : (
          <p>Please select a dog to view its health events.</p>
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
