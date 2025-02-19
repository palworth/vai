"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { collection, getDocs, query, where, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Dog {
  id: string;
  name: string;
  // add any additional fields if needed
}

interface DogSelectorProps {
  onSelect: (dog: Dog | null) => void;
  onHasMultipleDogs?: (hasMultiple: boolean) => void;
}

export default function DogSelector({ onSelect, onHasMultipleDogs }: DogSelectorProps) {
  const { user } = useAuth();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string>("");

  const fetchDogs = useCallback(async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const dogsQuery = query(collection(db, "dogs"), where("users", "array-contains", userRef));
      const querySnapshot = await getDocs(dogsQuery);
      const dogsList = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Dog[];
      setDogs(dogsList);
    } catch (error) {
      console.error("Error fetching dogs:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDogs();
    }
  }, [user, fetchDogs]);

  // Inform parent about whether there are multiple dogs.
  useEffect(() => {
    if (onHasMultipleDogs) {
      onHasMultipleDogs(dogs.length > 1);
    }
  }, [dogs, onHasMultipleDogs]);

  // Auto-select if only one dog exists.
  useEffect(() => {
    if (dogs.length === 1) {
      const onlyDog = dogs[0];
      setSelectedDogId(onlyDog.id);
      onSelect(onlyDog);
    }
  }, [dogs, onSelect]);

  const handleDogClick = (dogId: string) => {
    if (selectedDogId === dogId) {
      setSelectedDogId("");
      onSelect(null);
    } else {
      setSelectedDogId(dogId);
      const selectedDog = dogs.find((dog) => dog.id === dogId) || null;
      onSelect(selectedDog);
    }
  };

  // If there's only one dog, the UI is not rendered.
  if (dogs.length === 1) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex flex-wrap gap-4">
        {dogs.map((dog) => (
          <button
            key={dog.id}
            onClick={() => handleDogClick(dog.id)}
            className={`px-4 py-2 rounded-full shadow-md border transition-transform duration-200 transform ${
              selectedDogId === dog.id
                ? "bg-blue-500 text-white scale-120"
                : "bg-white text-gray-800 hover:scale-110"
            }`}
          >
            {dog.name}
          </button>
        ))}
      </div>
    </section>
  );
}
