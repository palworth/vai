"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface AddEventFormProps {
  eventType: string
}

const behaviorTypes = ["Barking", "Chewing", "Digging", "Jumping", "Whining", "Aggression", "Fear"]
const foodTypes = ["dry kibble", "raw", "custom", "wet", "homemade"]
const mentalStates = ["depressed", "anxious", "lethargic", "happy", "loving", "nervous"]
const exerciseActivities = [
  "Walking",
  "Running/Jogging",
  "Fetch",
  "Hiking",
  "Dog Park Playtime",
  "Indoor Play",
  "Outside Alone Time",
]
const exerciseSources = ["Manual Add", "Strava", "Whoop", "Fitbit", "Garmin", "Apple Health"]

const eventColors = {
  Behavior: "#C1693C",
  Exercise: "#3B2B75",
  Diet: "#D65B9D",
  Wellness: "#2B7CD5",
  Health: "#4CAF50",
}

export function AddEventForm({ eventType }: AddEventFormProps) {
  const [startDate, setStartDate] = useState(new Date())
  const [notes, setNotes] = useState("")
  const [severity, setSeverity] = useState(5)
  const [behaviorType, setBehaviorType] = useState("")
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)

  // Diet-specific state
  const [foodType, setFoodType] = useState("")
  const [brandName, setBrandName] = useState("")
  const [quantity, setQuantity] = useState(0)

  // Wellness-specific state
  const [mentalState, setMentalState] = useState("")
  const [wellnessNotes, setWellnessNotes] = useState("")
  const [wellnessSeverity, setWellnessSeverity] = useState(5)

  // Exercise-specific state
  const [activity, setActivity] = useState("")
  const [source, setSource] = useState("")
  const [distance, setDistance] = useState(0)
  const [duration, setDuration] = useState(0)

  // Health-specific state
  const [healthEventType, setHealthEventType] = useState("")
  const [healthNotes, setHealthNotes] = useState("")
  const [healthSeverity, setHealthSeverity] = useState(5)

  const currentColor = eventColors[eventType as keyof typeof eventColors]

  return (
    <div className="p-4 space-y-8 bg-gray-100">
      {eventType === "Behavior" && (
        <div className="space-y-4">
          <h3 className="text-gray-400 text-sm font-medium tracking-wider">BEHAVIOR TYPE</h3>
          <div className="relative">
            <div className="bg-white rounded-2xl">
              <button
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
                    className="w-full p-4 text-left text-gray-900 hover:bg-gray-50"
                    onClick={() => {
                      setBehaviorType(type)
                      setIsTypeDropdownOpen(false)
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
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
            <h3 className="text-gray-400 text-sm font-medium tracking-wider">HEALTH EVENT TYPE</h3>
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

      <div className="space-y-4">
        <h3 className="text-gray-400 text-sm font-medium tracking-wider">DATE</h3>
        <div className="bg-white rounded-2xl">
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null, event: React.SyntheticEvent<any> | undefined) => setStartDate(date as Date)}
            dateFormat="MMMM d, yyyy"
            className="w-full p-4 text-gray-900 bg-transparent"
          />
        </div>
      </div>

      {eventType === "Behavior" && (
        <>
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

      <button className="w-full py-4 rounded-full font-medium text-white" style={{ backgroundColor: currentColor }}>
        SAVE
      </button>
    </div>
  )
}

