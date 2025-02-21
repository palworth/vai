"use client";

import { useState, useEffect, useCallback } from "react";

interface HealthEvent {
  id: string;
  eventDate: string; // ISO date string
  type: string; // should be "health"
  data: {
    eventType?: string;
    notes?: string;
    severity?: number;
  };
}

interface HealthStatsProps {
  dogId: string;
}

export default function HealthStats({ dogId }: HealthStatsProps) {
  const [lastHealthEvent, setLastHealthEvent] = useState<HealthEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://us-central1-vai2-80fb0.cloudfunctions.net/getEventsByDog?dogId=${dogId}`
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      // Filter events for those where type is "health"
      const healthEvents = data.filter((event: any) => event.type === "health");
      // Sort by date in descending order (latest first)
      healthEvents.sort(
        (a: any, b: any) =>
          new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      );
      setLastHealthEvent(healthEvents.length > 0 ? healthEvents[0] : null);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Error fetching health events.");
      setLoading(false);
    }
  }, [dogId]);

  useEffect(() => {
    if (dogId) {
      fetchHealthEvents();
    }
  }, [dogId, fetchHealthEvents]);

  if (loading) {
    return <p>Loading health event...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="border p-4 mb-4 rounded shadow bg-gray-50">
      <h3 className="text-xl font-semibold mb-2">Last Health Event</h3>
      {lastHealthEvent ? (
        <div className="flex justify-between items-start">
          <div>
            <p>
              <strong>Event Type:</strong> {lastHealthEvent.data.eventType}
            </p>
            <p>
              <strong>Notes:</strong> {lastHealthEvent.data.notes}
            </p>
            <p>
              <strong>Severity:</strong> {lastHealthEvent.data.severity}
            </p>
          </div>
          <div className="text-right">
            {(() => {
              const eventDateObj = new Date(lastHealthEvent.eventDate);
              const datePart = eventDateObj.toLocaleDateString("en-US", {
                dateStyle: "medium",
              });
              const timePart = eventDateObj.toLocaleTimeString("en-US", {
                timeStyle: "short",
              });
              return (
                <>
                  <p className="font-semibold">{datePart}</p>
                  <p className="text-sm text-gray-500">{timePart}</p>
                </>
              );
            })()}
          </div>
        </div>
      ) : (
        <p>No health events found.</p>
      )}
    </div>
  );
}
