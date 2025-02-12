// app/diet-schedule/id/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import EventDetailView from "../../../components/EventDetailView";

export default function DietScheduleEventPage() {
  const { id } = useParams();
  const [scheduleEventData, setScheduleEventData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/diet-schedule-event/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setScheduleEventData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching diet schedule event:", err);
        setError(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading schedule event details...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!scheduleEventData) return <div>Schedule event not found</div>;

  return <EventDetailView data={scheduleEventData} />;
}
