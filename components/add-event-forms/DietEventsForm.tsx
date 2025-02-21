"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/app/contexts/AuthContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Loader2 } from "lucide-react";

interface DietEventsFormProps {
  dogId?: string;
  eventType: "Diet Exception" | "Diet Schedule";
  onSuccess: () => void;
}

export function DietEventsForm({ dogId, eventType, onSuccess }: DietEventsFormProps) {
  const { user } = useAuth();
  const storage = getStorage();

  // Cooldown hook for the submit button.
  const [cooldownActive, setCooldownActive] = useState(false);

  // Local dog selection state if no dogId is provided.
  const [dogs, setDogs] = useState<any[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string>("");

  useEffect(() => {
    if (!user || dogId) return;
    fetch(`/api/dogs?userId=${user.uid}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setDogs(data);
        if (data.length === 1) {
          setSelectedDogId(data[0].id);
        }
      })
      .catch((err) => {
        console.error("Error fetching dogs in DietEventsForm:", err);
      });
  }, [user, dogId]);

  const effectiveDogId = dogId || selectedDogId;

  // Common form field: event date.
  const [startDate, setStartDate] = useState(new Date());

  // For Diet Exception
  const [foodType, setFoodType] = useState("");
  const [notes, setNotes] = useState("");
  const [amount, setAmount] = useState<number>(0);

  // For Diet Schedule
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [feedingTimes, setFeedingTimes] = useState<string[]>([]);
  const [brandName, setBrandName] = useState("");
  const [quantity, setQuantity] = useState<number>(0);

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    if (!effectiveDogId) {
      alert("Please select a dog before creating an event.");
      return;
    }
    setCooldownActive(true);
    setTimeout(() => setCooldownActive(false), 10000);

    const payload: any = {
      eventDate: startDate.toISOString(),
      userId: user.uid,
      dogId: effectiveDogId,
      imageUrls: documentUrls,
    };

    if (eventType === "Diet Exception") {
      payload.foodType = foodType;
      payload.notes = notes;
      payload.amount = amount;
    } else if (eventType === "Diet Schedule") {
      payload.endDate = endDate ? endDate.toISOString() : null;
      payload.feedingTimes = feedingTimes; // e.g., ["morning", "evening", "allDay"]
      payload.brandName = brandName;
      payload.foodType = foodType;
      payload.quantity = quantity;
    }

    let endpoint = "";
    if (eventType === "Diet Exception") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createDietExceptionEvent";
    } else if (eventType === "Diet Schedule") {
      endpoint = "https://us-central1-vai2-80fb0.cloudfunctions.net/createDietScheduleEvent";
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
      console.error("Error creating diet event:", error);
    }
  };

  // For diet events, we assume time selection is not needed.
  const isTimeSelectable = false;

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-8 bg-gray-100">
      {/* Dog selection (if no dogId prop is provided) */}
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

      {/* Date selection */}
      <div className="space-y-4">
        <h3 className="text-gray-400 text-sm font-medium tracking-wider">DATE</h3>
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

      {eventType === "Diet Exception" && (
        <>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">FOOD TYPE</h3>
            <div className="bg-white rounded-2xl p-4">
              <input
                type="text"
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                placeholder="Enter food type"
                className="w-full p-4 text-gray-900 bg-transparent"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">NOTES</h3>
            <div className="bg-white rounded-2xl">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter notes"
                className="w-full p-4 text-gray-900 bg-transparent resize-none h-32"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">AMOUNT</h3>
            <div className="bg-white rounded-2xl p-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount"
                className="w-full p-4 text-gray-900 bg-transparent"
              />
            </div>
          </div>
        </>
      )}

      {eventType === "Diet Schedule" && (
        <>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">END DATE</h3>
            <div className="bg-white rounded-2xl p-4">
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date as Date)}
                dateFormat="MMMM d, yyyy"
                className="w-full p-4 text-gray-900 bg-transparent"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">
              FEEDING TIMES
            </h3>
            <div className="bg-white rounded-2xl p-4">
              <input
                type="text"
                value={feedingTimes.join(", ")}
                onChange={(e) => setFeedingTimes(e.target.value.split(",").map((s) => s.trim()))}
                placeholder="Enter feeding times separated by commas (e.g., morning, evening, allDay)"
                className="w-full p-4 text-gray-900 bg-transparent"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">BRAND NAME</h3>
            <div className="bg-white rounded-2xl p-4">
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter brand name"
                className="w-full p-4 text-gray-900 bg-transparent"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">FOOD TYPE</h3>
            <div className="bg-white rounded-2xl p-4">
              <input
                type="text"
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                placeholder="Enter food type"
                className="w-full p-4 text-gray-900 bg-transparent"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">QUANTITY</h3>
            <div className="bg-white rounded-2xl p-4">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Enter quantity"
                className="w-full p-4 text-gray-900 bg-transparent"
              />
            </div>
          </div>
        </>
      )}

      {/* File upload for both event types */}
      <div className="space-y-4">
        <h3 className="text-gray-400 text-sm font-medium tracking-wider">UPLOAD PHOTOS</h3>
        <div className="bg-white rounded-2xl p-4">
          <input type="file" multiple onChange={handleFileChange} className="w-full" />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!effectiveDogId || cooldownActive}
        className={`w-full py-4 rounded-full font-medium text-white transition-colors ${
          cooldownActive ? "bg-blue-700 shadow-inner" : "bg-blue-600"
        }`}
      >
        {cooldownActive ? (
          <Loader2 className="animate-spin w-6 h-6 mx-auto" />
        ) : (
          "SAVE"
        )}
      </button>
    </form>
  );
}
