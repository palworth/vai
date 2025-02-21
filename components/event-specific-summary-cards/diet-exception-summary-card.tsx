"use client";

import React from "react";

export interface DietExceptionEvent {
  id: string;
  eventDate: string;
  data: {
    foodType: string;
    notes: string;
    amount: number;
  };
  imageUrls?: string[];
}

export interface DietExceptionSummaryCardProps {
  event: DietExceptionEvent;
  onViewImage: (url: string) => void;
}

export function DietExceptionSummaryCard({
  event,
  onViewImage,
}: DietExceptionSummaryCardProps) {
  const eventDateObj = new Date(event.eventDate);
  const datePart = eventDateObj.toLocaleDateString("en-US", { dateStyle: "medium" });
  const timePart = eventDateObj.toLocaleTimeString("en-US", { timeStyle: "short" });

  return (
    <div className="border rounded-lg shadow-lg p-4 flex justify-between items-start transition duration-300">
      <div>
        <p>
          <strong>Food:</strong> {event.data.foodType}
        </p>
        <p>
          <strong>Notes:</strong> {event.data.notes}
        </p>
        <p>
          <strong>Amount:</strong> {event.data.amount}
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
