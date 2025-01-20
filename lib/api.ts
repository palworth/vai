import type { Timestamp } from "firebase/firestore"

type FirestoreReference = {
  id: string
  path: string
}

export interface Dog {
  id: string
  name: string
  breed: string
  age: number
  sex: "male" | "female"
  weight: number
  birthday: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
  users: FirestoreReference[]
  behaviorEventIds: string[]
  dietEventIds: string[]
  exerciseEventIds: string[]
  healthEventIds: FirestoreReference[]
}

export interface HealthEvent {
  id: string
  userId: string
  dogId: string
  createdAt: Timestamp
  updatedAt: Timestamp
  type: "health"
  eventType: string
  notes: string
  severity: number
}

export interface BehaviorEvent {
  id: string
  userId: string
  dogId: string
  createdAt: Timestamp
  updatedAt: Timestamp
  type: "behavior"
  eventType: string
  notes: string
  severity: number
}

export interface DietEvent {
  id: string
  userId: string
  dogId: string
  createdAt: Timestamp
  updatedAt: Timestamp
  type: "diet"
  foodType: "dry kibble" | "homemade" | "raw" | "custom" | "wet"
  brandName: string
  quantity: number
}

export interface ExerciseEvent {
  id: string
  userId: string
  dogId: string
  createdAt: Timestamp
  updatedAt: Timestamp
  type: "exercise"
  duration: number
  distance: number
  source: string
  activityType: string
}

export const api = {
  dogs: {
    getAll: async (): Promise<Dog[]> => {
      const response = await fetch("/api/dogs")
      if (!response.ok) throw new Error("Failed to fetch dogs")
      return response.json()
    },

    get: async (id: string): Promise<Dog> => {
      const response = await fetch(`/api/dogs/${id}`)
      if (!response.ok) throw new Error("Failed to fetch dog")
      return response.json()
    },

    create: async (
      dog: Omit<
        Dog,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "users"
        | "behaviorEventIds"
        | "dietEventIds"
        | "exerciseEventIds"
        | "healthEventIds"
      > & { userId: string },
    ): Promise<Dog> => {
      const response = await fetch("/api/dogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dog),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create dog")
      }
      return response.json()
    },

    update: async (
      id: string,
      dog: Partial<
        Omit<
          Dog,
          | "id"
          | "createdAt"
          | "updatedAt"
          | "users"
          | "behaviorEventIds"
          | "dietEventIds"
          | "exerciseEventIds"
          | "healthEventIds"
        >
      >,
    ): Promise<Dog> => {
      const response = await fetch(`/api/dogs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dog),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update dog")
      }
      return response.json()
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
      const response = await fetch(`/api/dogs/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete dog")
      }
      return response.json()
    },
  },
  healthEvents: {
    create: async (healthEvent: Omit<HealthEvent, "id" | "createdAt" | "updatedAt" | "type">): Promise<HealthEvent> => {
      const response = await fetch("/api/health-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(healthEvent),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create health event")
      }
      return response.json()
    },
  },
  behaviorEvents: {
    create: async (
      behaviorEvent: Omit<BehaviorEvent, "id" | "createdAt" | "updatedAt" | "type">,
    ): Promise<BehaviorEvent> => {
      const response = await fetch("/api/behavior-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(behaviorEvent),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create behavior event")
      }
      return response.json()
    },
  },
  dietEvents: {
    create: async (dietEvent: Omit<DietEvent, "id" | "createdAt" | "updatedAt" | "type">): Promise<DietEvent> => {
      const response = await fetch("/api/diet-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dietEvent),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create diet event")
      }
      return response.json()
    },
  },
  exerciseEvents: {
    create: async (
      exerciseEvent: Omit<ExerciseEvent, "id" | "createdAt" | "updatedAt" | "type">,
    ): Promise<ExerciseEvent> => {
      const response = await fetch("/api/exercise-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exerciseEvent),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create exercise event")
      }
      return response.json()
    },
  },
}

