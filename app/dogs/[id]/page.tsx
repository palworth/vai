"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import EventSummaryCard from "../../../components/EventSummaryCard";
import type { DataItem } from "../../../utils/types";

export default function DogDetailPage() {
  const params = useParams();
  const dogId = params.id as string;

  const [allEvents, setAllEvents] = useState<DataItem[]>([]);
  const [recentEvents, setRecentEvents] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  // Fetch events from all categories for this dog
  useEffect(() => {
    async function fetchAllEventsForDog() {
      try {
        const endpoints = [
          { url: `/api/behavior-events/data/by_dog?dogId=${dogId}`, type: "behavior" },
          { url: `/api/diet-events/data/by_dog?dogId=${dogId}`, type: "diet" },
          { url: `/api/exercise-events/data/by_dog?dogId=${dogId}`, type: "exercise" },
          { url: `/api/health-events/data/by_dog?dogId=${dogId}`, type: "health" },
          { url: `/api/wellness-events/data/by_dog?dogId=${dogId}`, type: "wellness" },
        ];

        const responses = await Promise.all(
          endpoints.map((e) =>
            fetch(e.url).then((res) => {
              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }
              return res.json();
            })
          )
        );

        // Combine the results from all endpoints.
        let combined: DataItem[] = [];
        endpoints.forEach((endpoint, i) => {
          // The API returns an object with key "<type>Events" e.g. "behaviorEvents"
          const key = endpoint.type + "Events";
          if (responses[i] && responses[i][key]) {
            const events: DataItem[] = responses[i][key].map((event: any) => ({
              ...event,
              type: endpoint.type, // ensure each event carries its type
            }));
            combined = combined.concat(events);
          }
        });

        // Sort combined events by eventDate descending.
        combined.sort(
          (a, b) =>
            new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
        );

        setAllEvents(combined);
        // Top 3 events for the recent section.
        setRecentEvents(combined.slice(0, 3));
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching events for dog:", err);
        setError(err);
        setLoading(false);
      }
    }

    if (dogId) {
      fetchAllEventsForDog();
    }
  }, [dogId]);

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Dog Events</h1>

      {/* Section 1: 3 Most Recent Events */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Recent Events</h2>
        {recentEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentEvents.map((event, index) => (
              <EventSummaryCard key={index} data={event} />
            ))}
          </div>
        ) : (
          <p>No recent events found.</p>
        )}
      </section>

      {/* Section 2: All Events for the Dog */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">All Events</h2>
        {allEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEvents.map((event, index) => (
              <EventSummaryCard key={index} data={event} />
            ))}
          </div>
        ) : (
          <p>No events found for this dog.</p>
        )}
      </section>

      <Link href="/dogs" className="text-blue-600 hover:underline">
        Back to Dogs
      </Link>
    </div>
  );
}
