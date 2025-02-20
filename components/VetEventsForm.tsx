// File: /components/VetEventsForm.tsx
"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/app/contexts/AuthContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface VetEventsFormProps {
  dogId: string;
  eventType: 
    | "Vet Appointment" 
    | "Vaccination Appointment" 
    | "Weight Change"
    | "Poop Journal"
    | "Health";
  onSuccess: () => void;
}

export function VetEventsForm({ dogId, eventType, onSuccess }: VetEventsFormProps) {
  const { user } = useAuth();
  const storage = getStorage();
  const [startDate, setStartDate] = useState(new Date());

  // Common state for some events
  const [notes, setNotes] = useState("");
  
  // States for Vet Appointment and Vaccination Appointment
  const [vetName, setVetName] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [vaccinationsType, setVaccinationsType] = useState("");

  // State for Weight Change
  const [weight, setWeight] = useState<number>(0);

  // New state for Poop Journal
  const [solidScale, setSolidScale] = useState<number>(5);

  // New states for Health event
  const [healthEventType, setHealthEventType] = useState("");
  const [healthNotes, setHealthNotes] = useState("");
  const [severity, setSeverity] = useState<number>(5);

  // File upload state (for vetDocuments)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(files);
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Create a unique file path that includes the event type
        const fileRef = ref(
          storage,
          `events/${eventType.replace(" ", "")}/${user?.uid}/${Date.now()}-${file.name}`
        );
        try {
          await uploadBytes(fileRef, file);
          const downloadURL = await getDownloadURL(fileRef);
          urls.push(downloadURL);
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
      setDocumentUrls(urls);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    // Build common payload
    const payload: any = {
      eventDate: startDate.toISOString(),
      userId: user.uid,
      dogId,
      imageUrls: documentUrls,
    };

    // Append fields based on the event type
    if (eventType === "Vet Appointment") {
      payload.notes = notes;
      payload.appointmentType = appointmentType;
      payload.vetName = vetName;
    } else if (eventType === "Vaccination Appointment") {
      payload.notes = notes;
      payload.vaccinationsType = vaccinationsType;
      payload.vetName = vetName;
    } else if (eventType === "Weight Change") {
      payload.notes = notes;
      payload.weight = weight;
    } else if (eventType === "Poop Journal") {
      payload.notes = notes;
      payload.solidScale = solidScale;
    } else if (eventType === "Health") {
      payload.healthEventType = healthEventType;
      payload.notes = healthNotes;
      payload.severity = severity;
    }

    // Determine the appropriate endpoint based on the event type
    let endpoint = "";
    if (eventType === "Vet Appointment") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createVetAppointmentEvent";
    } else if (eventType === "Vaccination Appointment") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createVaccinationAppointmentEvent";
    } else if (eventType === "Weight Change") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createWeightChangeEvent";
    } else if (eventType === "Poop Journal") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createPoopJournalEvent";
    } else if (eventType === "Health") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createHealthEvent";
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      onSuccess();
    } catch (error) {
      console.error("Error creating vet event:", error);
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

      {(eventType === "Vet Appointment" || eventType === "Vaccination Appointment") && (
        <>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">VET NAME</h3>
            <div className="bg-white rounded-2xl p-4">
              <input
                type="text"
                value={vetName}
                onChange={(e) => setVetName(e.target.value)}
                placeholder="Enter vet name"
                className="w-full p-4 text-gray-900 bg-transparent"
              />
            </div>
          </div>
          {eventType === "Vet Appointment" && (
            <div className="space-y-4">
              <h3 className="text-gray-400 text-sm font-medium tracking-wider">APPOINTMENT TYPE</h3>
              <div className="bg-white rounded-2xl p-4">
                <input
                  type="text"
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  placeholder="Enter appointment type"
                  className="w-full p-4 text-gray-900 bg-transparent"
                />
              </div>
            </div>
          )}
          {eventType === "Vaccination Appointment" && (
            <div className="space-y-4">
              <h3 className="text-gray-400 text-sm font-medium tracking-wider">VACCINATIONS TYPE</h3>
              <div className="bg-white rounded-2xl p-4">
                <input
                  type="text"
                  value={vaccinationsType}
                  onChange={(e) => setVaccinationsType(e.target.value)}
                  placeholder="Enter vaccinations type"
                  className="w-full p-4 text-gray-900 bg-transparent"
                />
              </div>
            </div>
          )}
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
          {/* File Upload for Vet Documents */}
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">Upload Vet Documents</h3>
            <div className="bg-white rounded-2xl p-4">
              <input type="file" multiple onChange={handleFileChange} className="w-full" />
            </div>
          </div>
        </>
      )}

      {eventType === "Weight Change" && (
        <div className="space-y-4">
          <h3 className="text-gray-400 text-sm font-medium tracking-wider">WEIGHT</h3>
          <div className="bg-white rounded-2xl p-4">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              placeholder="Enter weight"
              className="w-full p-4 text-gray-900 bg-transparent"
            />
          </div>
        </div>
      )}

      {eventType === "Poop Journal" && (
        <>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">NOTES</h3>
            <div className="bg-white rounded-2xl">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any notes..."
                className="w-full p-4 text-gray-900 bg-transparent resize-none h-32"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">SOLID SCALE (1-10)</h3>
            <div className="bg-white rounded-2xl p-4">
              <input
                type="number"
                value={solidScale}
                onChange={(e) => setSolidScale(Number(e.target.value))}
                min={1}
                max={10}
                placeholder="Rate solid scale"
                className="w-full p-4 text-gray-900 bg-transparent"
              />
            </div>
          </div>
        </>
      )}

      {eventType === "Health" && (
        <>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">HEALTH EVENT TYPE</h3>
            <div className="bg-white rounded-2xl p-4">
              <input
                type="text"
                value={healthEventType}
                onChange={(e) => setHealthEventType(e.target.value)}
                placeholder="Enter health event type"
                className="w-full p-4 text-gray-900 bg-transparent"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">NOTES</h3>
            <div className="bg-white rounded-2xl">
              <textarea
                value={healthNotes}
                onChange={(e) => setHealthNotes(e.target.value)}
                placeholder="Enter notes for the health event..."
                className="w-full p-4 text-gray-900 bg-transparent resize-none h-32"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">SEVERITY (1-10)</h3>
            <div className="bg-white rounded-2xl p-4">
              <input
                type="number"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                min={1}
                max={10}
                placeholder="Rate severity"
                className="w-full p-4 text-gray-900 bg-transparent"
              />
            </div>
          </div>
        </>
      )}

      <button
        type="submit"
        className="w-full py-4 rounded-full font-medium text-white"
        style={{ backgroundColor: eventType === "Weight Change" ? "#FF4500" : "#4169E1" }}
      >
        SAVE
      </button>
    </form>
  );
}
