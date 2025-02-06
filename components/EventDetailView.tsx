"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { type DataItem, formatDate } from "../utils/types";

// Options for behavior events – for behavior editing.
const behaviorTypes = [
  "Barking",
  "Chewing",
  "Digging",
  "Jumping",
  "Whining",
  "Aggression",
  "Fear",
];

const EventDetailView: React.FC<{ data: DataItem }> = ({ data }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // Set up editable state based on event type.
  const [editData, setEditData] = useState<any>(() => {
    if (data.type === "behavior") {
      return {
        behaviorType: data.behaviorType,
        severity: data.severity,
        notes: data.notes,
      };
    } else if (data.type === "diet") {
      return {
        foodType: data.foodType,
        brandName: data.brandName,
        quantity: data.quantity,
      };
    }
    return {};
  });

  // Common state for editing the event date
  const [editDate, setEditDate] = useState<Date>(
    data.eventDate ? new Date(data.eventDate) : new Date()
  );

  const getEventColor = (type: DataItem["type"]): string => {
    switch (type) {
      case "behavior":
        return "#C1693C";
      case "exercise":
        return "#3B2B75";
      case "diet":
        return "#D65B9D";
      case "wellness":
        return "#2B7CD5";
      case "health":
        return "#4CAF50";
      default:
        return "#000000";
    }
  };

  const eventColor = getEventColor(data.type);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Assuming this route works for behavior events; similar logic applies for diet, etc.
      const endpoint = `/api/${data.type}-events/${data.id}`;
      const res = await fetch(endpoint, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      // After deletion, navigate back to the list for that event type.
      router.push(`/${data.type}`);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleSaveClick = async () => {
    let payload: any = {};
    if (data.type === "behavior") {
      payload = {
        behaviorType: editData.behaviorType,
        severity: editData.severity,
        notes: editData.notes,
        eventDate: editDate.toISOString(),
      };
    } else if (data.type === "diet") {
      payload = {
        foodType: editData.foodType,
        brandName: editData.brandName,
        quantity: editData.quantity,
        eventDate: editDate.toISOString(),
      };
    }
    // Extend to other types as needed...

    try {
      const endpoint = `/api/${data.type}-events/${data.id}`;
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      setIsEditing(false);
      // Reload the page to show updated event data.
      window.location.reload();
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const renderEventDetails = () => {
    switch (data.type) {
      case "behavior": {
        const behaviorData = data as Extract<DataItem, { type: "behavior" }>;
        if (isEditing) {
          return (
            <>
              <div className="space-y-4">
                <label className="block font-semibold">Behavior Type:</label>
                <select
                  value={editData.behaviorType}
                  onChange={(e) =>
                    setEditData({ ...editData, behaviorType: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                >
                  <option value="">Select behavior type</option>
                  {behaviorTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-4">
                <label className="block font-semibold">Event Date:</label>
                <DatePicker
                  selected={editDate}
                  onChange={(date: Date | null) => setEditDate(date as Date)}
                  dateFormat="MMMM d, yyyy, h:mm aa"
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="space-y-4">
                <label className="block font-semibold">Severity:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editData.severity}
                  onChange={(e) =>
                    setEditData({ ...editData, severity: Number(e.target.value) })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="space-y-4">
                <label className="block font-semibold">Notes:</label>
                <textarea
                  value={editData.notes}
                  onChange={(e) =>
                    setEditData({ ...editData, notes: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={handleSaveClick}
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </>
          );
        } else {
          return (
            <>
              <p className="text-xl font-semibold">{behaviorData.behaviorType}</p>
              <p>Severity: {behaviorData.severity}</p>
              {behaviorData.notes && <p className="mt-4">Notes: {behaviorData.notes}</p>}
            </>
          );
        }
      }
      case "diet": {
        const dietData = data as Extract<DataItem, { type: "diet" }>;
        if (isEditing) {
          return (
            <>
              <div className="space-y-4">
                <label className="block font-semibold">Food Type:</label>
                <input
                  type="text"
                  value={editData.foodType}
                  onChange={(e) =>
                    setEditData({ ...editData, foodType: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="space-y-4">
                <label className="block font-semibold">Brand Name:</label>
                <input
                  type="text"
                  value={editData.brandName}
                  onChange={(e) =>
                    setEditData({ ...editData, brandName: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="space-y-4">
                <label className="block font-semibold">Quantity (g):</label>
                <input
                  type="number"
                  value={editData.quantity}
                  onChange={(e) =>
                    setEditData({ ...editData, quantity: Number(e.target.value) })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="space-y-4">
                <label className="block font-semibold">Event Date:</label>
                <DatePicker
                  selected={editDate}
                  onChange={(date: Date | null) => setEditDate(date as Date)}
                  dateFormat="MMMM d, yyyy, h:mm aa"
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={handleSaveClick}
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </>
          );
        } else {
          return (
            <>
              <p className="text-xl font-semibold">{dietData.foodType}</p>
              <p>Brand: {dietData.brandName}</p>
              <p>Quantity: {dietData.quantity} g</p>
            </>
          );
        }
      }
      case "exercise": {
        const exerciseData = data as Extract<DataItem, { type: "exercise" }>;
        return (
          <>
            <p className="text-xl font-semibold">{exerciseData.activityType}</p>
            <p>Distance: {exerciseData.distance} km</p>
            <p>Duration: {exerciseData.duration} min</p>
            <p>Source: {exerciseData.source}</p>
          </>
        );
      }
      case "wellness": {
        const wellnessData = data as Extract<DataItem, { type: "wellness" }>;
        return (
          <>
            <p className="text-xl font-semibold">{wellnessData.mentalState}</p>
            <p>Severity: {wellnessData.severity}</p>
            {wellnessData.notes && <p className="mt-4">Notes: {wellnessData.notes}</p>}
          </>
        );
      }
      case "health": {
        const healthData = data as Extract<DataItem, { type: "health" }>;
        return (
          <>
            <p className="text-xl font-semibold">{healthData.eventType}</p>
            <p>Severity: {healthData.severity}</p>
            {healthData.notes && <p className="mt-4">Notes: {healthData.notes}</p>}
          </>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center mb-6">
        <div
          className="w-16 h-16 rounded-full mr-4 flex items-center justify-center"
          style={{ backgroundColor: eventColor }}
        >
          <span className="text-white text-2xl font-bold">
            {data.type.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-bold capitalize" style={{ color: eventColor }}>
            {data.type}
          </h1>
          <p className="text-gray-600">{formatDate(data.eventDate)}</p>
        </div>
      </div>
      {data.dogName && (
        <div className="mb-6">
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
            Dog: {data.dogName}
          </span>
        </div>
      )}
      <div className="border-t border-gray-200 pt-6">{renderEventDetails()}</div>
      {!isEditing && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleEditClick}
            className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default EventDetailView;
