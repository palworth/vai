"use client";

import { useMemo } from "react";

interface PoopJournalEvent {
  id: string;
  eventDate: string; // ISO date string, e.g. "2025-02-19T03:06:31.000Z"
  data: {
    solidScale?: number;
  };
}

interface PoopJournalStatsProps {
  events: PoopJournalEvent[];
}

export default function PoopJournalStats({ events }: PoopJournalStatsProps) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { averageSolidScale, count, mostRecentSolidScale } = useMemo(() => {
    // Filter events to only those from the last 7 days.
    const recentEvents = events.filter((event) => {
      const eventDate = new Date(event.eventDate);
      return eventDate >= sevenDaysAgo && eventDate <= now;
    });

    const count = recentEvents.length;
    let averageSolidScale = 0;
    let mostRecentSolidScale = 0;
    
    if (count > 0) {
      // Calculate the average solid scale.
      const sum = recentEvents.reduce((acc, event) => {
        const scale = event.data.solidScale ?? 0;
        return acc + scale;
      }, 0);
      averageSolidScale = sum / count;

      // Determine the most recent event's solid scale.
      // Sort the events descending by eventDate.
      const sortedEvents = recentEvents.sort(
        (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      );
      mostRecentSolidScale = sortedEvents[0].data.solidScale ?? 0;
    }

    return { averageSolidScale, count, mostRecentSolidScale };
  }, [events, now, sevenDaysAgo]);

  return (
    <div className="border p-4 mb-4 rounded shadow bg-gray-50">
      <h3 className="text-xl font-semibold mb-2">Weekly Poop Stats</h3>
      <p>
        <strong>Average Solidity Scale (last 7 days):</strong>{" "}
        {averageSolidScale.toFixed(2)}
      </p>
      <p>
        <strong>Total Events (last 7 days):</strong> {count}
      </p>
      <p>
        <strong>Most Recent Solid Scale:</strong> {mostRecentSolidScale}
      </p>
    </div>
  );
}
