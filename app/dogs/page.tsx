"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DogCard from "@/components/DogCard";
import { useAuth } from "../contexts/AuthContext";

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

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Dogs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dogs.map((dog) => (
          <Link key={dog.id} href={`/dogs/${dog.id}`}>
           
              <DogCard data={dog} />
          
          </Link>
        ))}
      </div>
      <Link href="/" className="text-blue-600 hover:underline mt-4 block">
        Back to Home
      </Link>
    </div>
  );
}
