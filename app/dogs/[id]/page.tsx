"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import EventSummaryCard from "../../../components/EventSummaryCard";
import { GuidedProgramCard } from "@/components/guided-program-card";
import type { DataItem } from "../../../utils/types";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Define an interface for dog data from Firestore.
interface DogData {
  name?: string;
  breed?: string;
  imageUrl?: string;
}

// Define a type for diet schedule events that includes dog info.
type DietScheduleEvent = {
  id: string;
  eventDate: string;
  dogName: string;
  dogImageUrl: string;
  breed: string;
  type: "diet-schedule";
  scheduleName: string;
  feedingTimes: ("morning" | "evening" | "all day")[];
  foodType: string;
  brandName: string;
  quantity: number;
};

export default function DogDetailPage() {
  const params = useParams();
  const dogId = params.id as string;

  const [allEvents, setAllEvents] = useState<DataItem[]>([]);
  const [recentEvents, setRecentEvents] = useState<DataItem[]>([]);
  const [dietSchedules, setDietSchedules] = useState<DietScheduleEvent[]>([]);
  const [dogData, setDogData] = useState<DogData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  // Fetch the dog's data from Firestore using the dogId from the URL.
  useEffect(() => {
    async function fetchDogData() {
      try {
        const dogRef = doc(db, "dogs", dogId);
        const dogDoc = await getDoc(dogRef);
        if (dogDoc.exists()) {
          const data = dogDoc.data() as DogData;
          setDogData(data);
        } else {
          console.error("No dog document found for dogId:", dogId);
        }
      } catch (err) {
        console.error("Error fetching dog data:", err);
      }
    }
    if (dogId) {
      fetchDogData();
    }
  }, [dogId]);

  // Fetch events from all categories for this dog.
  useEffect(() => {
    async function fetchAllEventsForDog() {
      try {
        const endpoints = [
          { url: `/api/behavior-events/data/by_dog?dogId=${dogId}`, type: "behavior" },
          { url: `/api/diet-events/data/by_dog?dogId=${dogId}`, type: "diet" },
          { url: `/api/diet-schedule-event/data/by_dog?dogId=${dogId}`, type: "diet-schedule" },
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

        let combined: DataItem[] = [];
        endpoints.forEach((endpoint, i) => {
          const key =
            endpoint.type === "diet-schedule"
              ? "dietScheduleEvents"
              : endpoint.type + "Events";
          if (responses[i] && responses[i][key]) {
            const events: DataItem[] = responses[i][key].map((event: any) => ({
              ...event,
              type: endpoint.type,
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

  // Merge dogData into each diet schedule event.
  useEffect(() => {
    async function mergeDietSchedules() {
      if (!dogData) {
        return;
      }
      const dietEvents = allEvents.filter((event) => event.type === "diet-schedule");
      const merged = dietEvents.map((event) => {
        const mappedFeedingTimes = (event.feedingTimes as string[]).map((time) =>
          time === "allDay" ? "all day" : time
        );
        return {
          ...event,
          type: "diet-schedule",
          feedingTimes: mappedFeedingTimes,
          breed: dogData.breed ?? "Unknown Breed",
          dogName: dogData.name ?? "Unknown Dog",
          dogImageUrl: dogData.imageUrl ?? "",
        } as DietScheduleEvent;
      });

      setDietSchedules(merged);
    }
    mergeDietSchedules();
  }, [allEvents, dogData]);

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // For recent and all events, filter out diet schedule events.
  const nonDietEvents = allEvents.filter((event) => event.type !== "diet-schedule");

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Dog Events</h1>

      {/* Diet Schedule Section at the top */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Diet Schedule</h2>
        {dietSchedules.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {dietSchedules.map((schedule) => (
              <GuidedProgramCard key={schedule.id} data={schedule} />
            ))}
          </div>
        ) : (
          <p>No diet schedules found.</p>
        )}
      </section>

      {/* Recent Events Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Recent Events</h2>
        {recentEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentEvents
              .filter((event) => event.type !== "diet-schedule")
              .map((event, index) => (
                <EventSummaryCard key={index} data={event} />
              ))}
          </div>
        ) : (
          <p>No recent events found.</p>
        )}
      </section>

      {/* All Events Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">All Events</h2>
        {nonDietEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nonDietEvents.map((event, index) => (
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
