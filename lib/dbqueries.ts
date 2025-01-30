// lib/dbqueries.ts

import { db } from '@/lib/firebase'
import {
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
} from 'firebase/firestore'

export interface UserData {
  id: string
  full_name?: string
  // etc.
}

export interface DogData {
  id: string
  name?: string
  // etc.
}

// Example data structure for event docs
export interface DietEventData {
  dogId: string
  userId: string
  eventDate: any
  // ...
}

export interface ExerciseEventData {
  dogId: string
  userId: string
  eventDate: any
  // ...
}

/**
 * Return all users in 'users' collection. 
 * In real code, you might want to limit or handle pagination if there are thousands of users.
 */
export async function fetchAllUsers(): Promise<UserData[]> {
  const ref = collection(db, 'users')
  const snapshot = await getDocs(ref)
  const users: UserData[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as DocumentData
    return { id: docSnap.id, ...data }
  })
  return users
}

/**
 * Return all dogs that reference userId in their `users` array or `users` references.
 */
export async function fetchDogsForUser(userId: string): Promise<DogData[]> {
  // If 'dogs' doc has 'users' as array of doc references:
  // where('users', 'array-contains', doc(db, 'users', userId))
  // Or if it's an array of userId strings, do:
  // where('users', 'array-contains', userId)

  const dogsRef = collection(db, 'dogs')
  const q = query(
    dogsRef,
    where('users', 'array-contains', doc(db, 'users', userId))
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as DocumentData
    return { id: docSnap.id, ...data }
  })
}

/**
 * A simple helper to compute the absolute difference in days between two Dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const diff = Math.abs(date2.getTime() - date1.getTime())
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Return the most recent diet event for a dog.
 */
export async function fetchLastDietEvent(dogId: string): Promise<DietEventData | null> {
  const colRef = collection(db, 'dietEvents')
  const q = query(
    colRef,
    where('dogId', '==', dogId),
    orderBy('eventDate', 'desc'),
    limit(1)
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  return snapshot.docs[0].data() as DietEventData
}

/**
 * Return the most recent exercise event for a dog.
 */
export async function fetchLastExerciseEvent(dogId: string): Promise<ExerciseEventData | null> {
  const colRef = collection(db, 'exerciseEvents')
  const q = query(
    colRef,
    where('dogId', '==', dogId),
    orderBy('eventDate', 'desc'),
    limit(1)
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  return snapshot.docs[0].data() as ExerciseEventData
}
