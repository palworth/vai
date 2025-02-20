"use client";

import React from "react";

export interface PoopJournalEvent {
  id: string;
  eventDate: string;
  data: {
    notes?: string;
    solidScale?: number;
  };
  imageUrls?: string[];
}

export interface PoopJournalSummaryCardProps {
  event: PoopJournalEvent;
  onViewImage: (url: string) => void;
}

export function PoopJournalSummaryCard({
  event,
  onViewImage,
}: PoopJournalSummaryCardProps) {
  const eventDateObj = new Date(event.eventDate);
  const datePart = eventDateObj.toLocaleDateString("en-US", { dateStyle: "medium" });
  const timePart = eventDateObj.toLocaleTimeString("en-US", { timeStyle: "short" });

  return (
    <div className="border rounded-lg shadow-lg p-4 flex justify-between items-start transition duration-300">
      <div>
        {event.data?.notes && (
          <p>
            <strong>Notes:</strong> {event.data.notes}
          </p>
        )}
        <p>
          <strong>Solidity Scale:</strong> {event.data?.solidScale}
        </p>
        {(event.imageUrls?.length ?? 0) > 0 && (
          <button
            onClick={() => onViewImage(event.imageUrls![0])}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out"
          >
            view Image
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
