"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { SearchBarButton } from "@/components/search-bar";
import { EventGrid } from "@/components/event-grid";
import { GuidedProgramCard } from "@/components/guided-program-card";
import { CourseList } from "@/components/course-list";
import { FloatingActionButton } from "@/components/floating-action-button";
import { events, courses } from "@/constants/navigation";
import type { DataItem, FeedingTimeOption } from "@/utils/types";

// Define a type for diet schedule events
type DietScheduleEvent = {
  id: string;
  eventDate: string;
  dogName?: string;
  type: "diet-schedule";
  scheduleName: string;
  feedingTimes: FeedingTimeOption[];
  foodType: string;
  brandName: string;
  quantity: number;
};

export default function Home() {
  const { user } = useAuth();
  const [dietSchedules, setDietSchedules] = useState<DietScheduleEvent[]>([]);
  const [loadingDietSchedules, setLoadingDietSchedules] = useState(true);
  const [errorDietSchedules, setErrorDietSchedules] = useState<any>(null);

  // Fetch diet schedule events for the logged-in user.
  const fetchDietSchedules = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const res = await fetch(
        `/api/diet-schedule-event/data/all_per_user?userId=${user.uid}`
      );
      console.log(res);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      // Here we explicitly map the returned array to our DietScheduleEvent type.
      const schedules = (json.dietScheduleEvents as any[]).map((event) => ({
        ...event,
        type: "diet-schedule" as "diet-schedule",
      })) as DietScheduleEvent[];
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
