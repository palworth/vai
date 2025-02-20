"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/app/contexts/AuthContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface VetEventsFormProps {
  // If a dogId is passed, the form won't render any dog field/selector.
  dogId?: string;
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

  // Local dog selection state (used only if dogId isn't passed).
  const [dogs, setDogs] = useState<any[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string>("");

  useEffect(() => {
    // If a dogId prop is passed, we skip fetching user dogs entirely.
    if (!user || dogId) return;

    fetch(`/api/dogs?userId=${user.uid}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setDogs(data);
        // If exactly one dog, select it automatically
        if (data.length === 1) {
          setSelectedDogId(data[0].id);
        }
      })
      .catch((err) => {
        console.error("Error fetching dogs in VetEventsForm:", err);
      });
  }, [user, dogId]);

  // The dog ID we'll actually use for submission.
  // If dogId prop is provided, we always use that. Otherwise, we use the user's selection.
  const effectiveDogId = dogId || selectedDogId;

  // Form states for the rest of the event fields
  const [startDate, setStartDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [vetName, setVetName] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [vaccinationsType, setVaccinationsType] = useState("");
  const [weight, setWeight] = useState<number>(0);
  const [solidScale, setSolidScale] = useState<number>(5);
  const [healthEventType, setHealthEventType] = useState("");
  const [healthNotes, setHealthNotes] = useState("");
  const [severity, setSeverity] = useState<number>(5);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);

  // Whether we allow time selection in the DatePicker
  const isTimeSelectable =
    eventType === "Vet Appointment" || eventType === "Vaccination Appointment";

  // Handle file uploads
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(files);
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
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

  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    if (!effectiveDogId) {
      alert("Please select a dog before creating an event.");
      return;
    }

    const payload: any = {
      eventDate: startDate.toISOString(),
      userId: user.uid,
      dogId: effectiveDogId,
      imageUrls: documentUrls,
    };

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
      payload.eventType = healthEventType; // As required by your backend
      payload.notes = healthNotes;
      payload.severity = severity;
    }

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
      console.error("Error creating event:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-8 bg-gray-100">
      {/* Only render dog field if dogId prop is NOT provided */}
      {!dogId && (
        <>
          {dogs.length === 0 ? (
            <div className="space-y-4">
              <h3 className="text-gray-400 text-sm font-medium tracking-wider">Dog</h3>
              <div className="bg-white rounded-2xl p-4">
                <p className="text-gray-900">No dogs found.</p>
              </div>
            </div>
          ) : dogs.length === 1 ? (
            <div className="space-y-4">
              <h3 className="text-gray-400 text-sm font-medium tracking-wider">Dog</h3>
              <div className="bg-white rounded-2xl p-4">
                <p className="text-gray-900">{dogs[0].name}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-gray-400 text-sm font-medium tracking-wider">Select Dog</h3>
              <div className="bg-white rounded-2xl">
                <select
                  value={selectedDogId}
                  onChange={(e) => setSelectedDogId(e.target.value)}
                  className="w-full p-4 text-gray-900 bg-transparent"
                >
                  <option value="">Select a dog</option>
                  {dogs.map((dog) => (
                    <option key={dog.id} value={dog.id}>
                      {dog.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </>
      )}

      {/* DATE (and optional time) */}
      <div className="space-y-4">
        <h3 className="text-gray-400 text-sm font-medium tracking-wider">
          DATE{isTimeSelectable && " & TIME"}
        </h3>
        <div className="bg-white rounded-2xl">
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date as Date)}
            dateFormat={isTimeSelectable ? "MMMM d, yyyy h:mm aa" : "MMMM d, yyyy"}
            className="w-full p-4 text-gray-900 bg-transparent"
            showTimeSelect={isTimeSelectable}
            timeFormat="h:mm aa"
            timeIntervals={15}
          />
        </div>
      </div>

      {/* Vet or Vaccination fields */}
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
              <h3 className="text-gray-400 text-sm font-medium tracking-wider">
                VACCINATIONS TYPE
              </h3>
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
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">
              Upload Vet Documents
            </h3>
            <div className="bg-white rounded-2xl p-4">
              <input type="file" multiple onChange={handleFileChange} className="w-full" />
            </div>
          </div>
        </>
      )}

      {/* Weight Change */}
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

      {/* Poop Journal */}
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
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">
              SOLID SCALE (1-10)
            </h3>
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

      {/* Health */}
      {eventType === "Health" && (
        <>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">
              HEALTH EVENT TYPE
            </h3>
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
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">
              SEVERITY (1-10)
            </h3>
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
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">
              Upload Health Photos
            </h3>
            <div className="bg-white rounded-2xl p-4">
              <input type="file" multiple onChange={handleFileChange} className="w-full" />
            </div>
          </div>
        </>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!effectiveDogId} // Optional: disable if no dog is selected
        className={`w-full py-4 rounded-full font-medium text-white ${
          eventType === "Weight Change" ? "bg-orange-600" : "bg-blue-600"
        }`}
      >
        SAVE
      </button>
    </form>
  );
}
