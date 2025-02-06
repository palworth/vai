import React from "react";
import type { DataItem } from "../utils/types";
import { formatDate } from "../utils/types";
import { events as eventConfigs } from "../constants/navigation";
import { useRouter } from "next/navigation";

// Use the events array from your constants file to determine the background color.
const getCardColor = (type: DataItem["type"]): string => {
  const eventObj = eventConfigs.find(
    (ev) => ev.title.toLowerCase() === type.toLowerCase()
  );
  return eventObj ? eventObj.backgroundColor : "#FFFFFF";
};

// Helper to render notes if they exist.
const renderNotes = (notes: string) =>
  notes && notes.trim() !== "" ? (
    <p>
      <span className="font-semibold">Notes:</span> {notes}
    </p>
  ) : null;

const EventSummaryCard: React.FC<{ data: DataItem }> = ({ data }) => {
  const router = useRouter();

  // When the card is clicked, navigate to the event detail page.
  const handleClick = () => {
    // Build the path using the event type (assumed lowercase) and the event id.
    router.push(`/${data.type}/${data.id}`);
  };

  const renderContent = () => {
    switch (data.type) {
      case "behavior":
        return (
          <>
            <p className="text-lg font-semibold">{data.behaviorType}</p>
            <p>Severity: {data.severity}</p>
            {renderNotes(data.notes)}
          </>
        );
      case "exercise":
        return (
          <>
            <p className="text-lg font-semibold">{data.activityType}</p>
            <p>Distance: {data.distance} km</p>
            <p>Duration: {data.duration} min</p>
            <p>Source: {data.source}</p>
          </>
        );
      case "diet":
        return (
          <>
            <p className="text-lg font-semibold">{data.foodType}</p>
            <p>Brand: {data.brandName}</p>
            <p>Quantity: {data.quantity} g</p>
          </>
        );
      case "wellness":
        return (
          <>
            <p className="text-lg font-semibold">{data.mentalState}</p>
            <p>Severity: {data.severity}</p>
            {renderNotes(data.notes)}
          </>
        );
      case "health":
        return (
          <>
            <p className="text-lg font-semibold">{data.eventType}</p>
            <p>Severity: {data.severity}</p>
            {renderNotes(data.notes)}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer rounded-xl p-6 shadow-md text-white"
      style={{ backgroundColor: getCardColor(data.type) }}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold capitalize">{data.type}</h3>
        {data.dogName && (
          <span className="inline-block bg-white text-gray-800 rounded-full px-3 py-1 text-sm font-semibold">
            {data.dogName}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-4">{formatDate(data.eventDate)}</p>
      {renderContent()}
    </div>
  );
};

export default EventSummaryCard;
