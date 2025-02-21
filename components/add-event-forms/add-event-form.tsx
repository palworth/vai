"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/app/contexts/AuthContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Existing event types arrays.
const behaviorTypes = ["Barking", "Chewing", "Digging", "Jumping", "Whining", "Aggression", "Fear"];
const mentalStates = ["depressed", "anxious", "lethargic", "happy", "loving", "nervous"];
const exerciseActivities = [
  "Walking",
  "Running/Jogging",
  "Fetch",
  "Hiking",
  "Dog Park Playtime",
  "Indoor Play",
  "Outside Alone Time",
];
const exerciseSources = ["Manual Add", "Strava", "Whoop", "Fitbit", "Garmin", "Apple Health"];

const eventColors = {
  Behavior: "#C1693C",
  Wellness: "#2B7CD5",
  Exercise: "#3B2B75",
};

interface AddEventFormProps {
  eventType: string;
  onSuccess: () => void; // Called after successful submission to drop down the menu.
}

export function AddEventForm({ eventType, onSuccess }: AddEventFormProps) {
  // Common state
  const [startDate, setStartDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [severity, setSeverity] = useState(5);

  // Behavior-specific state
  const [behaviorType, setBehaviorType] = useState("");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // Wellness-specific state
  const [mentalState, setMentalState] = useState("");
  const [wellnessNotes, setWellnessNotes] = useState("");
  const [wellnessSeverity, setWellnessSeverity] = useState(5);

  // Exercise-specific state
  const [activity, setActivity] = useState("");
  const [source, setSource] = useState("");
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);

  // New: Image/file upload state (for all event types)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Dog selection state
  const [dogs, setDogs] = useState<any[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string>("");

  // New: Cooldown state for the save button
  const [cooldownActive, setCooldownActive] = useState(false);

  const { user } = useAuth();
  const storage = getStorage();

  // Fetch the list of dogs for the current user.
  useEffect(() => {
    if (!user) return;
    fetch(`/api/dogs?userId=${user.uid}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setDogs(data);
        if (data.length === 1) {
          setSelectedDogId(data[0].id);
        }
      })
      .catch((err) => {
        console.error("Error fetching dogs in AddEventForm:", err);
      });
  }, [user]);

  const currentColor = eventColors[eventType as keyof typeof eventColors];

  // Handler for file input change. Uploads selected files and stores their URLs.
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(files);
      const urls: string[] = [];
      // Loop through each selected file.
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Create a unique file path in storage (you might include userId, dogId, event type, etc.)
        const fileRef = ref(storage, `events/${selectedDogId}/${Date.now()}-${file.name}`);
        try {
          // Upload the file.
          await uploadBytes(fileRef, file);
          // Get the download URL.
          const downloadURL = await getDownloadURL(fileRef);
          urls.push(downloadURL);
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
      setImageUrls(urls);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    if (!selectedDogId) {
      alert("Please select a dog for the event.");
      return;
    }

    // Activate cooldown and reset it after 10 seconds.
    setCooldownActive(true);
    setTimeout(() => setCooldownActive(false), 10000);

    // Build common payload.
    const payload: any = {
      eventDate: startDate.toISOString(),
      userId: user.uid,
      dogId: selectedDogId,
      imageUrls, // Include uploaded file URLs.
    };

    // Append event-specific fields.
    if (eventType === "Behavior") {
      payload.behaviorType = behaviorType;
      payload.severity = severity;
      payload.notes = notes;
    } else if (eventType === "Wellness") {
      payload.mentalState = mentalState;
      payload.severity = wellnessSeverity;
      payload.notes = wellnessNotes;
    } else if (eventType === "Exercise") {
      payload.activityType = activity;
      payload.source = source;
      payload.distance = distance;
      payload.duration = duration;
    }

    // Determine API endpoint based on eventType.
    let endpoint = "";
    if (eventType.toLowerCase() === "behavior") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createBehaviorEvent";
    } else if (eventType.toLowerCase() === "wellness") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createWellnessEvent";
    } else if (eventType.toLowerCase() === "exercise") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createExerciseEvent";
    } else {
      endpoint = `/api/${eventType.toLowerCase()}-events`;
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
      const responseData = await res.json();
      console.log("Event created successfully:", responseData);
      onSuccess();
    } catch (error: any) {
      console.error("Error creating event:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-8 bg-gray-100">
      {/* Dog Selection */}
      {dogs.length > 1 ? (
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
      ) : (
        dogs.length === 1 && (
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">Dog</h3>
            <div className="bg-white rounded-2xl p-4">
              <p className="text-gray-900">{dogs[0].name}</p>
            </div>
          </div>
        )
      )}

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

      {/* Conditional UI for various event types */}
      {eventType === "Behavior" && (
        <>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">BEHAVIOR TYPE</h3>
            <div className="relative">
              <div className="bg-white rounded-2xl">
                <button
                  type="button"
                  className="w-full p-4 flex items-center justify-between text-gray-900"
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                >
                  {behaviorType || "Select behavior type"}
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              {isTypeDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-lg overflow-hidden">
                  {behaviorTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className="w-full p-4 text-left text-gray-900 hover:bg-gray-50"
                      onClick={() => {
                        setBehaviorType(type);
                        setIsTypeDropdownOpen(false);
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">SEVERITY</h3>
            <div className="bg-white rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: currentColor }}
                />
                <span className="text-gray-900 min-w-[1.5rem]">{severity}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">NOTES</h3>
            <div className="bg-white rounded-2xl">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter notes here..."
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400 resize-none h-32"
              />
            </div>
          </div>
        </>
      )}

      {eventType === "Wellness" && (
        <>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">MENTAL STATE</h3>
            <div className="bg-white rounded-2xl">
              <select
                value={mentalState}
                onChange={(e) => setMentalState(e.target.value)}
                className="w-full p-4 text-gray-900 bg-transparent"
              >
                <option value="">Select mental state</option>
                {mentalStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">SEVERITY</h3>
            <div className="bg-white rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessSeverity}
                  onChange={(e) => setWellnessSeverity(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: currentColor }}
                />
                <span className="text-gray-900 min-w-[1.5rem]">{wellnessSeverity}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">NOTES</h3>
            <div className="bg-white rounded-2xl">
              <textarea
                value={wellnessNotes}
                onChange={(e) => setWellnessNotes(e.target.value)}
                placeholder="Enter notes here..."
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400 resize-none h-32"
              />
            </div>
          </div>
        </>
      )}

      {eventType === "Exercise" && (
        <>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">ACTIVITY</h3>
            <div className="bg-white rounded-2xl">
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full p-4 text-gray-900 bg-transparent"
              >
                <option value="">Select activity</option>
                {exerciseActivities.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">SOURCE</h3>
            <div className="bg-white rounded-2xl">
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full p-4 text-gray-900 bg-transparent"
              >
                <option value="">Select source</option>
                {exerciseSources.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">DISTANCE (MILES)</h3>
            <div className="bg-white rounded-2xl">
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                placeholder="Enter distance in miles"
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">DURATION (HOURS)</h3>
            <div className="bg-white rounded-2xl">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                placeholder="Enter duration in hours"
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400"
              />
            </div>
          </div>
        </>
      )}

      {/* File Upload section */}
      <div className="space-y-4">
        <h3 className="text-gray-400 text-sm font-medium tracking-wider">Upload Photos</h3>
        <div className="bg-white rounded-2xl p-4">
          <input type="file" multiple onChange={handleFileChange} className="w-full" />
        </div>
      </div>

      {/* Save Button with cooldown and loading icon */}
      <button
        type="submit"
        disabled={!selectedDogId || cooldownActive}
        className={`w-full py-4 rounded-full font-medium text-white transition-colors ${
          cooldownActive ? "bg-blue-700 shadow-inner" : "bg-blue-600"
        }`}
      >
        {cooldownActive ? <Loader2 className="animate-spin w-6 h-6 mx-auto" /> : "SAVE"}
      </button>
    </form>
  );
}
