"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import EventSummaryCard from "../../../components/EventSummaryCard";
import { GuidedProgramCard } from "@/components/diet-schedule-card";
import { InstructorInfo } from "@/components/DogInfo";
import type { DataItem } from "../../../utils/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface DogData {
  name?: string;
  breed?: string;
  imageUrl?: string;
}

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

  // Fetch the dog's data
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

  // Fetch events from all categories
  useEffect(() => {
    async function fetchAllEventsForDog() {
      try {
        const endpoints = [
          { url: `/api/behavior-events/data/by_dog?dogId=${dogId}`, type: "behavior" },
          { url: `/api/diet-events/data/by_dog?dogId=${dogId}`, type: "diet" },
          { url: `/api/diet-schedule-event/data/by_dog?dogId=${dogId}`, type: "diet-schedule" },
          { url: `/api/exercise-events/data/by_dog?dogId=${dogId}`, type: "exercise" },
          { url: `https://us-central1-vai2-80fb0.cloudfunctions.net/getHealthEventsByDog?dogId=${dogId}`, type: "health" },
          { url: `/api/wellness-events/data/by_dog?dogId=${dogId}`, type: "wellness" },
        ];

        const responses = await Promise.all(
          endpoints.map(async (endpoint) => {
            const res = await fetch(endpoint.url);
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status} for URL: ${endpoint.url}`);
            }
            return { type: endpoint.type, data: await res.json() };
          })
        );

        let combined: DataItem[] = [];
        for (let i = 0; i < endpoints.length; i++) {
          const { type } = endpoints[i];
          const { data } = responses[i];

          // For each endpoint, figure out where the events array lives
          const key = type === "diet-schedule" ? "dietScheduleEvents" : type + "Events";

          let eventsArray = data;
          if (type === "health" && Array.isArray(data)) {
            // Cloud Function for health events returns an array directly
            eventsArray = data;
          } else if (data[key] && Array.isArray(data[key])) {
            eventsArray = data[key];
          } else {
            eventsArray = [];
          }

          // Attach dogName from dogData if available
          const typedEvents: DataItem[] = eventsArray.map((event: any) => ({
            ...event,
            type,
            dogName: dogData?.name,
          }));

          combined = combined.concat(typedEvents);
        }

        // Sort by eventDate descending
        combined.sort(
          (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
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
  }, [dogId, dogData]);

  // Merge dogData into diet schedule events
  useEffect(() => {
    if (!dogData) return;
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
  }, [allEvents, dogData]);

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const nonDietEvents = allEvents.filter((event) => event.type !== "diet-schedule");

  return (
    <div className="p-4">
      {/* Header: large dog info on the left */}
      <header className="mb-8">
        {dogData && (
          <InstructorInfo
            name={dogData.name || "Unknown Dog"}
            imageUrl={dogData.imageUrl}
            breed={dogData.breed || "Unknown Breed"}
            size="large"   // <-- Makes it bigger
          />
        )}
      </header>

      {/* Diet Schedule Section */}
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
