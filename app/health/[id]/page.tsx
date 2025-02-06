"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import EventDetailView from "../../../components/EventDetailView";

export default function HealthEventPage() {
  const { id } = useParams();
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/health-events/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setEventData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching health event:", err);
        setError(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading event details...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!eventData) return <div>Event not found</div>;

  return <EventDetailView data={eventData} />;
}
