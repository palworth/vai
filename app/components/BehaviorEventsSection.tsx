"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Edit2, Trash2 } from "lucide-react"

interface BehaviorEvent {
  id: string
  dogId: string
  userId: string
  createdAt: string
  updatedAt: string
  type: "behavior"
  behaviorType: string
  notes: string
  severity: number
  eventDate: string
}

interface BehaviorEventsSectionProps {
  dogId: string
  showToast: (title: string, description: string, isError: boolean) => void
}

export function BehaviorEventsSection({ dogId, showToast }: BehaviorEventsSectionProps) {
  const router = useRouter()
  const [behaviorEvents, setBehaviorEvents] = useState<BehaviorEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBehaviorEvents = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/behavior-events?dogId=${dogId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch behavior events")
      }
      const data = await response.json()
      console.log("Fetched behavior events:", data)
      setBehaviorEvents(data)
    } catch (error) {
      console.error("Error fetching behavior events:", error)
      setError("Failed to fetch behavior events. Please try again later.")
      showToast("Error", "Failed to fetch behavior events", true)
    } finally {
      setIsLoading(false)
    }
  }, [dogId, showToast])

  useEffect(() => {
    fetchBehaviorEvents()
  }, [fetchBehaviorEvents])

  const handleDeleteBehaviorEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/behavior-events?id=${eventId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete event")
      }
      fetchBehaviorEvents()
      showToast("Behavior Event Deleted", "The behavior event has been successfully deleted.", false)
    } catch (error) {
      console.error("Error deleting behavior event:", error)
      showToast("Error", "There was a problem deleting the behavior event.", true)
    }
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Behavior Events</h2>
        <Button
          onClick={() => {
            router.push(`/behavior/add?dogId=${dogId}`)
          }}
          className="bg-primary text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center">Loading behavior events...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {behaviorEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-primary p-4 text-white">
                  <h3 className="text-lg font-semibold">{event.behaviorType}</h3>
                  <p className="text-sm opacity-80">
                    {event.eventDate ? format(new Date(event.eventDate), "MMMM d, yyyy HH:mm") : "No date available"}
                  </p>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Severity:</span> {event.severity}/10
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Notes:</span> {event.notes || "No notes provided"}
                  </p>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Link href={`/behavior/${event.id}`} passHref>
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteBehaviorEvent(event.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

