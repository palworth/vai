"use client";

import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/app/contexts/AuthContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Existing event types arrays.
const behaviorTypes = ["Barking", "Chewing", "Digging", "Jumping", "Whining", "Aggression", "Fear"];
const foodTypes = ["dry kibble", "raw", "custom", "wet", "homemade"];
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
  Exercise: "#3B2B75",
  Diet: "#D65B9D",
  "Diet Schedule": "#2e8b57",
  Wellness: "#2B7CD5",
  Health: "#4CAF50",
  "Diet Exception": "#FFA500",
  "Poop Journal": "#8B4513",
  "Vet Appointment": "#4169E1",
  "Vaccination Appointment": "#32CD32",
  "Weight Change": "#FF4500",
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

  // Diet-specific state (for Diet events)
  const [foodType, setFoodType] = useState("");
  const [brandName, setBrandName] = useState("");
  const [quantity, setQuantity] = useState(0);

  // Additional state for Diet Schedule events
  const [scheduleName, setScheduleName] = useState("");
  const [feedingTimes, setFeedingTimes] = useState<string[]>([]);

  // Wellness-specific state
  const [mentalState, setMentalState] = useState("");
  const [wellnessNotes, setWellnessNotes] = useState("");
  const [wellnessSeverity, setWellnessSeverity] = useState(5);

  // Exercise-specific state
  const [activity, setActivity] = useState("");
  const [source, setSource] = useState("");
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);

  // Health-specific state
  const [healthEventType, setHealthEventType] = useState("");
  const [healthNotes, setHealthNotes] = useState("");
  const [healthSeverity, setHealthSeverity] = useState(5);

  // New: Diet Exception-specific state
  const [dietExceptionFoodType, setDietExceptionFoodType] = useState("");
  const [dietExceptionNotes, setDietExceptionNotes] = useState("");
  const [dietExceptionAmount, setDietExceptionAmount] = useState(0);

  // New: Poop Journal-specific state
  const [poopJournalNotes, setPoopJournalNotes] = useState("");
  const [poopJournalSolidScale, setPoopJournalSolidScale] = useState(5);

  // New: Vet Appointment-specific state
  const [vetAppointmentType, setVetAppointmentType] = useState("");
  const [vetAppointmentVetName, setVetAppointmentVetName] = useState("");
  const [vetAppointmentNotes, setVetAppointmentNotes] = useState("");
  const [vetAppointmentDocuments, setVetAppointmentDocuments] = useState<string[]>([]);

  // New: Vaccination Appointment-specific state
  const [vaccinationAppointmentType, setVaccinationAppointmentType] = useState("");
  const [vaccinationAppointmentVetName, setVaccinationAppointmentVetName] = useState("");
  const [vaccinationAppointmentNotes, setVaccinationAppointmentNotes] = useState("");
  const [vaccinationAppointmentDocuments, setVaccinationAppointmentDocuments] = useState<string[]>([]);

  // New: Weight Change-specific state
  const [weightChangeWeight, setWeightChangeWeight] = useState(0);

  // New: Image upload state (for all event types)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Dog selection state
  const [dogs, setDogs] = useState<any[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string>("");

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

  // Handler for feeding times checkboxes for Diet Schedule.
  const handleFeedingTimeChange = (time: string, checked: boolean) => {
    if (time === "allDay") {
      if (checked) {
        setFeedingTimes(["allDay"]);
      } else {
        setFeedingTimes([]);
      }
    } else {
      if (feedingTimes.includes("allDay")) return;
      if (checked) {
        setFeedingTimes([...feedingTimes, time]);
      } else {
        setFeedingTimes(feedingTimes.filter((t) => t !== time));
      }
    }
  };

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

    // Build common payload.
    const payload: any = {
      eventDate: startDate.toISOString(),
      userId: user.uid,
      dogId: selectedDogId,
      imageUrls, // Include uploaded image URLs.
    };

    // Append event-specific fields.
    if (eventType === "Behavior") {
      payload.behaviorType = behaviorType;
      payload.severity = severity;
      payload.notes = notes;
    } else if (eventType === "Diet") {
      payload.foodType = foodType;
      payload.brandName = brandName;
      payload.quantity = quantity;
    } else if (eventType === "Diet Schedule") {
      payload.scheduleName = scheduleName;
      payload.feedingTimes = feedingTimes;
      payload.foodType = foodType;
      payload.brandName = brandName;
      payload.quantity = quantity;
    } else if (eventType === "Wellness") {
      payload.mentalState = mentalState;
      payload.severity = wellnessSeverity;
      payload.notes = wellnessNotes;
    } else if (eventType === "Exercise") {
      payload.activityType = activity;
      payload.source = source;
      payload.distance = distance;
      payload.duration = duration;
    } else if (eventType === "Health") {
      payload.eventType = healthEventType;
      payload.severity = healthSeverity;
      payload.notes = healthNotes;
    } else if (eventType === "Diet Exception") {
      payload.foodType = dietExceptionFoodType;
      payload.notes = dietExceptionNotes;
      payload.amount = dietExceptionAmount;
    } else if (eventType === "Poop Journal") {
      payload.notes = poopJournalNotes;
      payload.solidScale = poopJournalSolidScale;
    } else if (eventType === "Vet Appointment") {
      payload.appointmentType = vetAppointmentType;
      payload.vetName = vetAppointmentVetName;
      payload.notes = vetAppointmentNotes;
      payload.vetDocuments = vetAppointmentDocuments;
    } else if (eventType === "Vaccination Appointment") {
      payload.vaccinationsType = vaccinationAppointmentType;
      payload.vetName = vaccinationAppointmentVetName;
      payload.notes = vaccinationAppointmentNotes;
      payload.vetDocuments = vaccinationAppointmentDocuments;
    } else if (eventType === "Weight Change") {
      payload.weight = weightChangeWeight;
    }

    // Determine API endpoint based on eventType.
    let endpoint = "";
    if (eventType === "Diet Schedule") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createDietScheduleEvent";
    } else if (eventType.toLowerCase() === "health") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createHealthEventNew";
    } else if (eventType.toLowerCase() === "behavior") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createBehaviorEvent";
    } else if (eventType.toLowerCase() === "wellness") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createWellnessEvent";
    } else if (eventType.toLowerCase() === "exercise") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createExerciseEvent";
    } else if (eventType === "Diet Exception") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createDietExceptionEvent";
    } else if (eventType === "Poop Journal") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createPoopJournalEvent";
    } else if (eventType === "Vet Appointment") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createVetAppointmentEvent";
    } else if (eventType === "Vaccination Appointment") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createVaccinationAppointmentEvent";
    } else if (eventType === "Weight Change") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createWeightChangeEvent";
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

      {eventType === "Diet" && (
        <>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">FOOD TYPE</h3>
            <div className="bg-white rounded-2xl">
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                className="w-full p-4 text-gray-900 bg-transparent"
              >
                <option value="">Select food type</option>
                {foodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">BRAND NAME</h3>
            <div className="bg-white rounded-2xl">
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter brand name"
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">QUANTITY (GRAMS)</h3>
            <div className="bg-white rounded-2xl">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Enter quantity in grams"
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400"
              />
            </div>
          </div>
        </>
      )}

      {eventType === "Diet Schedule" && (
        <>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">SCHEDULE NAME</h3>
            <div className="bg-white rounded-2xl">
              <input
                type="text"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                placeholder="Enter schedule name"
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">FEEDING TIMES</h3>
            <div className="bg-white rounded-2xl p-4">
              <label className="mr-4">
                <input
                  type="checkbox"
                  value="morning"
                  checked={feedingTimes.includes("morning")}
                  onChange={(e) => handleFeedingTimeChange("morning", e.target.checked)}
                />{" "}
                Morning
              </label>
              <label className="mr-4">
                <input
                  type="checkbox"
                  value="evening"
                  checked={feedingTimes.includes("evening")}
                  onChange={(e) => handleFeedingTimeChange("evening", e.target.checked)}
                />{" "}
                Evening
              </label>
              <label>
                <input
                  type="checkbox"
                  value="allDay"
                  checked={feedingTimes.includes("allDay")}
                  onChange={(e) => handleFeedingTimeChange("allDay", e.target.checked)}
                />{" "}
                All Day
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">FOOD TYPE</h3>
            <div className="bg-white rounded-2xl">
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                className="w-full p-4 text-gray-900 bg-transparent"
              >
                <option value="">Select food type</option>
                {foodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">BRAND NAME</h3>
            <div className="bg-white rounded-2xl">
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter brand name"
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">QUANTITY (GRAMS)</h3>
            <div className="bg-white rounded-2xl">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Enter quantity in grams"
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400"
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

      {eventType === "Health" && (
        <>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">EVENT TYPE</h3>
            <div className="bg-white rounded-2xl">
              <input
                type="text"
                value={healthEventType}
                onChange={(e) => setHealthEventType(e.target.value)}
                placeholder="Enter health event type"
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400"
              />
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
                  value={healthSeverity}
                  onChange={(e) => setHealthSeverity(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: currentColor }}
                />
                <span className="text-gray-900 min-w-[1.5rem]">{healthSeverity}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">NOTES</h3>
            <div className="bg-white rounded-2xl">
              <textarea
                value={healthNotes}
                onChange={(e) => setHealthNotes(e.target.value)}
                placeholder="Enter notes here..."
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400 resize-none h-32"
              />
            </div>
          </div>
        </>
      )}

      {eventType === "Diet Exception" && (
        <>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">FOOD TYPE</h3>
            <div className="bg-white rounded-2xl">
              <input
                type="text"
                value={dietExceptionFoodType}
                onChange={(e) => setDietExceptionFoodType(e.target.value)}
                placeholder="Enter food type"
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">NOTES</h3>
            <div className="bg-white rounded-2xl">
              <textarea
                value={dietExceptionNotes}
                onChange={(e) => setDietExceptionNotes(e.target.value)}
                placeholder="Enter notes here..."
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400 resize-none h-32"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">AMOUNT</h3>
            <div className="bg-white rounded-2xl">
              <input
                type="number"
                value={dietExceptionAmount}
                onChange={(e) => setDietExceptionAmount(Number(e.target.value))}
                placeholder="Enter amount"
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400"
              />
            </div>
          </div>
        </>
      )}

      {eventType === "Poop Journal" && (
        <>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">NOTES</h3>
            <div className="bg-white rounded-2xl">
              <textarea
                value={poopJournalNotes}
                onChange={(e) => setPoopJournalNotes(e.target.value)}
                placeholder="Enter notes here..."
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400 resize-none h-32"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">SOLID SCALE</h3>
            <div className="bg-white rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={poopJournalSolidScale}
                  onChange={(e) => setPoopJournalSolidScale(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: currentColor }}
                />
                <span className="text-gray-900 min-w-[1.5rem]">{poopJournalSolidScale}</span>
              </div>
            </div>
          </div>
        </>
      )}

{eventType === "Vet Appointment" && (
        <>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">APPOINTMENT TYPE</h3>
            <div className="bg-white rounded-2xl">
              <input
                type="text"
                value={vetAppointmentType}
                onChange={(e) => setVetAppointmentType(e.target.value)}
                placeholder="Enter appointment type"
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">VET NAME</h3>
            <div className="bg-white rounded-2xl">
              <input
                type="text"
                value={vetAppointmentVetName}
                onChange={(e) => setVetAppointmentVetName(e.target.value)}
                placeholder="Enter vet name"
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">NOTES</h3>
            <div className="bg-white rounded-2xl">
              <textarea
                value={vetAppointmentNotes}
                onChange={(e) => setVetAppointmentNotes(e.target.value)}
                placeholder="Enter notes here..."
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400 resize-none h-32"
              />
            </div>
          </div>
        </>
      )}

      {eventType === "Vaccination Appointment" && (
        <>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">VACCINATIONS TYPE</h3>
            <div className="bg-white rounded-2xl">
              <input
                type="text"
                value={vaccinationAppointmentType}
                onChange={(e) => setVaccinationAppointmentType(e.target.value)}
                placeholder="Enter vaccinations type"
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">VET NAME</h3>
            <div className="bg-white rounded-2xl">
              <input
                type="text"
                value={vaccinationAppointmentVetName}
                onChange={(e) => setVaccinationAppointmentVetName(e.target.value)}
                placeholder="Enter vet name"
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">NOTES</h3>
            <div className="bg-white rounded-2xl">
              <textarea
                value={vaccinationAppointmentNotes}
                onChange={(e) => setVaccinationAppointmentNotes(e.target.value)}
                placeholder="Enter notes here..."
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400 resize-none h-32"
              />
            </div>
          </div>
        </>
      )}

      {eventType === "Weight Change" && (
        <>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">WEIGHT</h3>
            <div className="bg-white rounded-2xl">
              <input
                type="number"
                value={weightChangeWeight}
                onChange={(e) => setWeightChangeWeight(Number(e.target.value))}
                placeholder="Enter weight"
                className="w-full p-4 text-gray-900 bg-transparent placeholder-gray-400"
              />
            </div>
          </div>
        </>
      )}

      {/* Upload Photos section moved to bottom */}
      <div className="space-y-4">
        <h3 className="text-gray-400 text-sm font-medium tracking-wider">Upload Photos</h3>
        <div className="bg-white rounded-2xl p-4">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full"
          />
        </div>
      </div>

      <button type="submit" className="w-full py-4 rounded-full font-medium text-white" style={{ backgroundColor: currentColor }}>
        SAVE
      </button>
    </form>
  );
}
