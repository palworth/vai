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
  healthEventIds: string[]
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
}

