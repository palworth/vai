"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { SearchBarButton } from "@/components/search-bar";
import { EventGrid } from "@/components/event-grid";
import { GuidedProgramCard } from "@/components/diet-schedule-card";
import { CourseList } from "@/components/course-list";
import { FloatingActionButton } from "@/components/floating-action-button";
import { events, courses } from "@/constants/navigation";
import type { DataItem, FeedingTimeOption } from "@/utils/types";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

// Define an interface for dog data from Firestore.
interface DogData {
  name?: string;
  breed?: string;
  imageUrl?: string;
}

/**
 * Merges dog data into a diet schedule event.
 * If event.dogId exists, fetch the dog's document.
 * If not, attempt to query by event.dogName.
 * Maps "allDay" to "all day" for feedingTimes.
 */
async function mergeDogData(event: any): Promise<DietScheduleEvent> {
  let breed = "Unknown Breed";
  let dogName = event.dogName || "Unknown Dog";
  let dogImageUrl = "";
  
  // If dogId is present, fetch the dog's document.
  if (event.dogId) {
    try {
      const dogRef = doc(db, "dogs", event.dogId);
      const dogDoc = await getDoc(dogRef);
      if (dogDoc.exists()) {
        const dogData = dogDoc.data() as DogData;
        breed = dogData.breed ?? breed;
        dogName = dogData.name ?? dogName;
        dogImageUrl = dogData.imageUrl ?? "";
      }
    } catch (err) {
      console.error("Error fetching dog data for event", event.id, err);
    }
  } else if (event.dogName) {
    // If no dogId, try querying the dogs collection by dogName.
    try {
      const q = query(collection(db, "dogs"), where("name", "==", event.dogName));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const dogDoc = querySnapshot.docs[0];
        const dogData = dogDoc.data() as DogData;
        breed = dogData.breed ?? breed;
        dogName = dogData.name ?? dogName;
        dogImageUrl = dogData.imageUrl ?? "";
      }
    } catch (err) {
      console.error("Error querying dog data for event", event.id, err);
    }
  } else {
    console.warn(`Event ${event.id} has no dogId and no dogName.`);
  }

  const mappedFeedingTimes = (event.feedingTimes as string[]).map((time) =>
    time === "allDay" ? "all day" : time
  );

  return {
    ...event,
    type: "diet-schedule",
    feedingTimes: mappedFeedingTimes,
    breed,
    dogName,
    dogImageUrl,
  } as DietScheduleEvent;
}

export default function Home() {
  const { user } = useAuth();
  const [dietSchedules, setDietSchedules] = useState<DietScheduleEvent[]>([]);
  const [loadingDietSchedules, setLoadingDietSchedules] = useState(true);
  const [errorDietSchedules, setErrorDietSchedules] = useState<any>(null);

  // Fetch diet schedule events and merge in dog data.
  const fetchDietSchedules = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const res = await fetch(`/api/diet-schedule-event/data/all_per_user?userId=${user.uid}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();

      if (!Array.isArray(json.dietScheduleEvents)) {
        throw new Error("Invalid data structure from API");
      }

      const schedules = await Promise.all(
        (json.dietScheduleEvents as any[]).map(mergeDogData)
      );
      setDietSchedules(schedules);
      setLoadingDietSchedules(false);
    } catch (error) {
      console.error("Error fetching diet schedules:", error);
      setErrorDietSchedules(error);
      setLoadingDietSchedules(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      fetchDietSchedules();
    }
  }, [user?.uid, fetchDietSchedules]);

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      <div className="flex-grow overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBarButton />
          <div className="pt-16 pb-20">
            <EventGrid events={events} />
            {/* Diet Schedule Section */}
            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-4">My Diet Schedules</h2>
              {loadingDietSchedules ? (
                <p>Loading diet schedules...</p>
              ) : errorDietSchedules ? (
                <p>Error loading diet schedules: {errorDietSchedules.message}</p>
              ) : dietSchedules.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {dietSchedules.map((schedule) => (
                    <GuidedProgramCard key={schedule.id} data={schedule} />
                  ))}
                </div>
              ) : (
                <p>No diet schedules found.</p>
              )}
            </section>
            <CourseList courses={courses} />
          </div>
        </div>
      </div>
      <FloatingActionButton />
    </div>
  );
}
