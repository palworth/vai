"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/app/contexts/AuthContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface PoopJournalFormProps {
  dogId: string; // New prop to pass the selected dog's ID
  onSuccess: () => void;
}

export function PoopJournalForm({ dogId, onSuccess }: PoopJournalFormProps) {
  const [startDate, setStartDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [solidScale, setSolidScale] = useState(5);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { user } = useAuth();
  const storage = getStorage();

  // Handler for file input change: uploads files and collects download URLs.
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(files);
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Create a unique file path (include userId and event type)
        const fileRef = ref(
          storage,
          `events/poopJournal/${user?.uid}/${Date.now()}-${file.name}`
        );
        try {
          await uploadBytes(fileRef, file);
          const downloadURL = await getDownloadURL(fileRef);
          urls.push(downloadURL);
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
      setImageUrls(urls);
    }
  };

  // Handler for form submission: builds payload and posts to the Poop Journal endpoint.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    // Now include the dogId from props in your payload
    const payload = {
      eventDate: startDate.toISOString(),
      userId: user.uid,
      dogId, // This is required by your API
      notes,
      solidScale,
      imageUrls, // URLs from uploaded photos
    };

    try {
      const res = await fetch(
        "https://us-central1-vai2-80fb0.cloudfunctions.net/createPoopJournalEvent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      onSuccess();
    } catch (error) {
      console.error("Error creating Poop Journal event:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-8 bg-gray-100">
      {/* Date Picker */}
      <div className="space-y-4">
        <h3 className="text-gray-400 text-sm font-medium tracking-wider">DATE</h3>
        <div className="bg-white rounded-2xl">
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date as Date)}
            dateFormat="MMMM d, yyyy"
            className="w-full p-4 text-gray-900 bg-transparent"
          />
        </div>
      </div>

      {/* Poop Journal Notes */}
      <div className="space-y-4">
        <h3 className="text-gray-400 text-sm font-medium tracking-wider">NOTES</h3>
        <div className="bg-white rounded-2xl">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter notes here..."
            className="w-full p-4 text-gray-900 bg-transparent resize-none h-32"
          />
        </div>
      </div>

      {/* Poop Journal Solid Scale */}
      <div className="space-y-4">
        <h3 className="text-gray-400 text-sm font-medium tracking-wider">SOLID SCALE</h3>
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="10"
              value={solidScale}
              onChange={(e) => setSolidScale(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "#8B4513" }}
            />
            <span className="text-gray-900 min-w-[1.5rem]">{solidScale}</span>
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="space-y-4">
        <h3 className="text-gray-400 text-sm font-medium tracking-wider">Upload Photos</h3>
        <div className="bg-white rounded-2xl p-4">
          <input type="file" multiple onChange={handleFileChange} className="w-full" />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-4 rounded-full font-medium text-white"
        style={{ backgroundColor: "#8B4513" }}
      >
        SAVE
      </button>
    </form>
  );
}
