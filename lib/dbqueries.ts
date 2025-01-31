// lib/dbqueries.ts

import { db } from '@/lib/firebase'
import {
  collection,
  getDocs,
  doc,
  getDoc,
  DocumentData,
  DocumentReference,
} from 'firebase/firestore'

export interface UserData {
  id: string
  full_name?: string
  email?: string
  // etc.
}

export interface DogData {
  id: string
  name?: string
  breed?: string
  dietEventIds?: DocumentReference[]
  exerciseEventIds?: DocumentReference[]
  wellnessEventIds?: DocumentReference[]
  behaviorEventIds?: DocumentReference[]
}

// Diet event structure
export interface DietEventData {
  dogId?: string | DocumentReference
  userId?: string | DocumentReference
  brandName?: string
  foodType?: string
  quantity?: number
  eventDate?: any
}

// Exercise event structure
export interface ExerciseEventData {
  dogId?: string | DocumentReference
  userId?: string | DocumentReference
  activityType?: string
  distance?: number
  duration?: number
  eventDate?: any
}

// Wellness event structure
export interface WellnessEventData {
  mentalState?: string
  severityLevel?: number
  eventDate?: any
}

// Behavior event structure
export interface BehaviorEventData {
  behaviorType?: string
  severityLevel?: number
  eventDate?: any
}

/**
 * Fetch a single user doc
 */
export async function fetchUserData(userId: string): Promise<UserData | null> {
  const userRef = doc(db, 'users', userId)
  const snap = await getDoc(userRef)
  if (!snap.exists()) return null

  const data = snap.data() as DocumentData
  return {
    id: snap.id,
    full_name: data.full_name ?? '',
    email: data.email ?? '',
  }
}

/**
 * Fetch a single dog doc
 */
export async function fetchDogData(dogId: string): Promise<DogData | null> {
  const dogRef = doc(db, 'dogs', dogId)
  const snap = await getDoc(dogRef)
  if (!snap.exists()) return null

  const data = snap.data() as DocumentData
  return {
    id: snap.id,
    name: data.name ?? '',
    breed: data.breed ?? '',
    dietEventIds: data.dietEventIds ?? [],
    exerciseEventIds: data.exerciseEventIds ?? [],
    wellnessEventIds: data.wellnessEventIds ?? [],
    behaviorEventIds: data.behaviorEventIds ?? [],
  }
}

/**
 * Loop over dog's dietEventIds references to find the most recent event
 */
export async function fetchLastDietEventByRefs(dogDoc: DogData | null): Promise<DietEventData | null> {
  if (!dogDoc?.dietEventIds || dogDoc.dietEventIds.length === 0) {
    return null
  }

  let lastEvent: DietEventData | null = null
  let lastTimestamp: number | null = null

  for (const eventRef of dogDoc.dietEventIds) {
    if (!eventRef) continue
    const eventSnap = await getDoc(eventRef)
    if (!eventSnap.exists()) continue

    const data = eventSnap.data()
    const dateField = data.eventDate
    if (!dateField) continue

    const eventDate = dateField.toDate ? dateField.toDate() : new Date(dateField)
    const msTime = eventDate.getTime()

    if (!lastTimestamp || msTime > lastTimestamp) {
      lastTimestamp = msTime
      lastEvent = {
        dogId: data.dogId,
        userId: data.userId,
        brandName: data.brandName ?? '',
        foodType: data.foodType ?? '',
        quantity: data.quantity ?? 0,
        eventDate: data.eventDate,
      }
    }
  }

  return lastEvent
}

/**
 * Loop over dog's exerciseEventIds references to find the most recent event
 */
export async function fetchLastExerciseEventByRefs(dogDoc: DogData | null): Promise<ExerciseEventData | null> {
  if (!dogDoc?.exerciseEventIds || dogDoc.exerciseEventIds.length === 0) {
    return null
  }

  let lastEvent: ExerciseEventData | null = null
  let lastTimestamp: number | null = null

  for (const eventRef of dogDoc.exerciseEventIds) {
    if (!eventRef) continue
    const eventSnap = await getDoc(eventRef)
    if (!eventSnap.exists()) continue

    const data = eventSnap.data()
    const dateField = data.eventDate
    if (!dateField) continue

    const eventDate = dateField.toDate ? dateField.toDate() : new Date(dateField)
    const msTime = eventDate.getTime()

    if (!lastTimestamp || msTime > lastTimestamp) {
      lastTimestamp = msTime
      lastEvent = {
        dogId: data.dogId,
        userId: data.userId,
        activityType: data.activityType ?? '',
        distance: data.distance ?? 0,
        duration: data.duration ?? 0,
        eventDate: data.eventDate,
      }
    }
  }

  return lastEvent
}

/**
 * Loop over dog's wellnessEventIds references to find the most recent event
 */
export async function fetchLastWellnessEventByRefs(dogDoc: DogData | null): Promise<WellnessEventData | null> {
  if (!dogDoc?.wellnessEventIds || dogDoc.wellnessEventIds.length === 0) {
    return null
  }

  let lastEvent: WellnessEventData | null = null
  let lastTimestamp: number | null = null

  for (const eventRef of dogDoc.wellnessEventIds) {
    if (!eventRef) continue
    const eventSnap = await getDoc(eventRef)
    if (!eventSnap.exists()) continue

    const data = eventSnap.data()
    const dateField = data.eventDate
    if (!dateField) continue

    const eventDate = dateField.toDate ? dateField.toDate() : new Date(dateField)
    const msTime = eventDate.getTime()

    if (!lastTimestamp || msTime > lastTimestamp) {
      lastTimestamp = msTime
      lastEvent = {
        mentalState: data.mentalState ?? '',
        severityLevel: data.severity ?? 0, // or data.severityLevel if that's what you store
        eventDate: data.eventDate,
      }
    }
  }

  return lastEvent
}

/**
 * Loop over dog's behaviorEventIds references to find the most recent event
 */
export async function fetchLastBehaviorEventByRefs(dogDoc: DogData | null): Promise<BehaviorEventData | null> {
  if (!dogDoc?.behaviorEventIds || dogDoc.behaviorEventIds.length === 0) {
    return null
  }

  let lastEvent: BehaviorEventData | null = null
  let lastTimestamp: number | null = null

  for (const eventRef of dogDoc.behaviorEventIds) {
    if (!eventRef) continue
    const eventSnap = await getDoc(eventRef)
    if (!eventSnap.exists()) continue

    const data = eventSnap.data()
    const dateField = data.eventDate
    if (!dateField) continue

    const eventDate = dateField.toDate ? dateField.toDate() : new Date(dateField)
    const msTime = eventDate.getTime()

    if (!lastTimestamp || msTime > lastTimestamp) {
      lastTimestamp = msTime
      lastEvent = {
        behaviorType: data.behaviorType ?? '',
        severityLevel: data.severityLevel ?? 0,
        eventDate: data.eventDate,
      }
    }
  }

  return lastEvent
}

/**
 * Helper to compute daysBetween two Dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const diff = Math.abs(date2.getTime() - date1.getTime())
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}
