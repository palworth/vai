"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { type DataItem, formatDate } from "../utils/types";
import { EVENT_COLORS } from "../constants/colors";

const behaviorTypes = [
  "Barking",
  "Chewing",
  "Digging",
  "Jumping",
  "Whining",
  "Aggression",
  "Fear",
];

const exerciseActivities = [
  "Walking",
  "Running/Jogging",
  "Fetch",
  "Hiking",
  "Dog Park Playtime",
  "Indoor Play",
  "Outside Alone Time",
];
const exerciseSources = [
  "Manual Add",
  "Strava",
  "Whoop",
  "Fitbit",
  "Garmin",
  "Apple Health",
];

const mentalStates = [
  "depressed",
  "anxious",
  "lethargic",
  "happy",
  "loving",
  "nervous",
];

const EventDetailView: React.FC<{ data: DataItem }> = ({ data }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // Initialize editable state based on event type.
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
    } else if (data.type === "exercise") {
      return {
        activityType: data.activityType,
        source: data.source,
        distance: data.distance,
        duration: data.duration,
      };
    } else if (data.type === "wellness") {
      return {
        mentalState: data.mentalState,
        severity: data.severity,
        notes: data.notes,
      };
    } else if (data.type === "health") {
      return {
        eventType: data.eventType,
        severity: data.severity,
        notes: data.notes,
      };
    } else if (data.type === "diet-schedule") {
      return {
        scheduleName: data.scheduleName,
        feedingTimes: data.feedingTimes, // e.g., ["morning", "evening"]
        foodType: data.foodType,
        brandName: data.brandName,
        quantity: data.quantity,
      };
    }
    return {};
  });

  // Common state for editing the event date.
  const [editDate, setEditDate] = useState<Date>(
    data.eventDate ? new Date(data.eventDate) : new Date()
  );

  const getEventColor = (type: DataItem["type"]): string => {
    return EVENT_COLORS[type] || EVENT_COLORS.default;
  };

  const eventColor = getEventColor(data.type);

  // Build the correct API endpoint depending on the event type.
  const getApiEndpoint = (): string => {
    if (data.type === "diet-schedule") {
      // For diet schedule events, use singular "diet-schedule-event"
      return `/api/diet-schedule-event/${data.id}`;
    }
    // For other event types, use plural (e.g., behavior-events, exercise-events, etc.)
    return `/api/${data.type}-events/${data.id}`;
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const endpoint = getApiEndpoint();
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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
    } else if (data.type === "exercise") {
      payload = {
        activityType: editData.activityType,
        source: editData.source,
        distance: editData.distance,
        duration: editData.duration,
        eventDate: editDate.toISOString(),
      };
    } else if (data.type === "wellness") {
      payload = {
        mentalState: editData.mentalState,
        severity: editData.severity,
        notes: editData.notes,
        eventDate: editDate.toISOString(),
      };
    } else if (data.type === "health") {
      payload = {
        eventType: editData.eventType,
        severity: editData.severity,
        notes: editData.notes,
        eventDate: editDate.toISOString(),
      };
    } else if (data.type === "diet-schedule") {
      payload = {
        scheduleName: editData.scheduleName,
        feedingTimes: editData.feedingTimes,
        foodType: editData.foodType,
        brandName: editData.brandName,
        quantity: editData.quantity,
        eventDate: editDate.toISOString(),
      };
    }
    try {
      const endpoint = getApiEndpoint();
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      setIsEditing(false);
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
              {behaviorData.notes && (
                <p className="mt-4">Notes: {behaviorData.notes}</p>
              )}
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
        if (isEditing) {
          return (
            <>
              <div className="space-y-4">
                <label className="block font-semibold">Activity Type:</label>
                <select
                  value={editData.activityType}
                  onChange={(e) =>
                    setEditData({ ...editData, activityType: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                >
                  <option value="">Select activity type</option>
                  {exerciseActivities.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-4">
                <label className="block font-semibold">Source:</label>
                <select
                  value={editData.source}
                  onChange={(e) =>
                    setEditData({ ...editData, source: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                >
                  <option value="">Select source</option>
                  {exerciseSources.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-4">
                <label className="block font-semibold">Distance (km):</label>
                <input
                  type="number"
                  value={editData.distance}
                  onChange={(e) =>
                    setEditData({ ...editData, distance: Number(e.target.value) })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="space-y-4">
                <label className="block font-semibold">Duration (min):</label>
                <input
                  type="number"
                  value={editData.duration}
                  onChange={(e) =>
                    setEditData({ ...editData, duration: Number(e.target.value) })
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
              <p className="text-xl font-semibold">{exerciseData.activityType}</p>
              <p>Distance: {exerciseData.distance} km</p>
              <p>Duration: {exerciseData.duration} min</p>
              <p>Source: {exerciseData.source}</p>
            </>
          );
        }
      }
      case "wellness": {
        const wellnessData = data as Extract<DataItem, { type: "wellness" }>;
        if (isEditing) {
          return (
            <>
              <div className="space-y-4">
                <label className="block font-semibold">Mental State:</label>
                <select
                  value={editData.mentalState}
                  onChange={(e) =>
                    setEditData({ ...editData, mentalState: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                >
                  <option value="">Select mental state</option>
                  {mentalStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
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
              <p className="text-xl font-semibold">{wellnessData.mentalState}</p>
              <p>Severity: {wellnessData.severity}</p>
              {wellnessData.notes && (
                <p className="mt-4">Notes: {wellnessData.notes}</p>
              )}
            </>
          );
        }
      }
      case "health": {
        const healthData = data as Extract<DataItem, { type: "health" }>;
        if (isEditing) {
          return (
            <>
              <div className="space-y-4">
                <label className="block font-semibold">Health Event Type:</label>
                <input
                  type="text"
                  value={editData.eventType}
                  onChange={(e) =>
                    setEditData({ ...editData, eventType: e.target.value })
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
              <p className="text-xl font-semibold">{healthData.eventType}</p>
              <p>Severity: {healthData.severity}</p>
              {healthData.notes && (
                <p className="mt-4">Notes: {healthData.notes}</p>
              )}
            </>
          );
        }
      }
      case "diet-schedule": {
        const scheduleData = data as Extract<DataItem, { type: "diet-schedule" }>;
        if (isEditing) {
          return (
            <>
              <div className="space-y-4">
                <label className="block font-semibold">Schedule Name:</label>
                <input
                  type="text"
                  value={editData.scheduleName}
                  onChange={(e) =>
                    setEditData({ ...editData, scheduleName: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="space-y-4">
                <label className="block font-semibold">
                  Feeding Times (comma separated):
                </label>
                <input
                  type="text"
                  value={editData.feedingTimes.join(", ")}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      feedingTimes: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
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
                <label className="block font-semibold">Quantity:</label>
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
              <p className="text-xl font-semibold">{scheduleData.scheduleName}</p>
              <p>Feeding Times: {scheduleData.feedingTimes.join(", ")}</p>
              <p>Food Type: {scheduleData.foodType}</p>
              <p>Brand: {scheduleData.brandName}</p>
              <p>Quantity: {scheduleData.quantity}</p>
            </>
          );
        }
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
