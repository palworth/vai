"use client";

import React from "react";

export interface HealthEvent {
  id: string;
  eventDate: string;
  data: {
    eventType?: string;
    notes?: string;
    severity?: number; // from 1 to 10
  };
  imageUrls?: string[];
}

export interface HealthSummaryCardProps {
  event: HealthEvent;
  onViewImage: (url: string) => void;
}

export function HealthSummaryCard({
  event,
  onViewImage,
}: HealthSummaryCardProps) {
  const eventDateObj = new Date(event.eventDate);
  const datePart = eventDateObj.toLocaleDateString("en-US", { dateStyle: "medium" });
  const timePart = eventDateObj.toLocaleTimeString("en-US", { timeStyle: "short" });

  return (
    <div className="border rounded-lg shadow-lg p-4 flex justify-between items-start transition duration-300">
      <div>
        {event.data?.eventType && (
          <p>
            <strong>Event Type:</strong> {event.data.eventType}
          </p>
        )}
        {event.data?.notes && (
          <p>
            <strong>Notes:</strong> {event.data.notes}
          </p>
        )}
        <p>
          <strong>Severity:</strong> {event.data?.severity}
        </p>
        {(event.imageUrls?.length ?? 0) > 0 && (
          <button
            onClick={() => onViewImage(event.imageUrls![0])}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out"
          >
            View Image
          </button>
        )}
      </div>
      <div className="text-right">
        <p className="font-semibold">{datePart}</p>
        <p className="text-sm text-gray-500">{timePart}</p>
      </div>
    </div>
  );
}
