"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";

export default function WellnessEventsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!user) return; // Wait until user is available.
    // Construct the API URL with the userId query parameter.
    const url = `/api/wellness-events/data/all_per_user?userId=${user.uid}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching wellness events:", err);
        setError(err);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Wellness Events JSON</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
      <Link href="/" className="mt-4 text-blue-600 hover:underline">
        Back to Home
      </Link>
    </div>
  );
}
