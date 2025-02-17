"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DogCard from "@/components/DogCard";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { PawPrint } from "lucide-react";

export default function DogsPage() {
  const { user } = useAuth();
  const [dogs, setDogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/dogs?userId=${user.uid}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setDogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching dogs:", err);
        setError(err);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const addDogButton = (
    <Link href="/dogs/add">
      <Button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
        <PawPrint className="w-5 h-5 mr-2" />
        Add Your Dog
      </Button>
    </Link>
  );

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Dogs</h1>
      {dogs.length === 0 ? (
        <div className="mb-4">
          <p className="text-xl mb-2">Add your dog to get started!</p>
          {addDogButton}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogs.map((dog) => (
              <Link key={dog.id} href={`/dogs/${dog.id}`}>
                <DogCard data={dog} />
              </Link>
            ))}
          </div>
          {/* Show the "Add Your Dog" button at the bottom */}
          <div className="mt-8">
            {addDogButton}
          </div>
        </>
      )}
      <Link href="/" className="text-blue-600 hover:underline mt-4 block">
        Back to Home
      </Link>
    </div>
  );
}
