// lib/notifications.ts

import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  query,
  where,
  getDocs,
  DocumentData,
} from 'firebase/firestore'
import {
  fetchUserData,
  fetchDogData,
  fetchLastDietEventByRefs,
  fetchLastExerciseEventByRefs,
  daysBetween,
} from '@/lib/dbqueries'
import { generateNotificationMessage } from '@/lib/openai'
import { buildDietPrompt, buildExercisePrompt } from '@/utils/prompts'

// NotificationDoc definition
export interface NotificationDoc {
  id: string
  userId: string
  dogId: string
  title: string
  message: string
  read: boolean
  type: string
  createdAt: Date
}

/**
 * createDietNotification: fetches dogDoc and uses fetchLastDietEventByRefs
 */
export async function createDietNotification(
  userId: string,
  dogId: string,
  customMessage?: string
): Promise<NotificationDoc> {
  const userDoc = await fetchUserData(userId)
  console.log('[createDietNotification] userDoc ->', userDoc)

  const dogDoc = await fetchDogData(dogId)
  console.log('[createDietNotification] dogDoc ->', dogDoc)

  const lastDiet = await fetchLastDietEventByRefs(dogDoc)
  console.log('[createDietNotification] lastDiet ->', lastDiet)

  let daysSince = 0
  let brandName = ''
  let foodType = ''
  let quantity = 0
  let lastDateString = 'Unknown date'

  if (lastDiet?.eventDate) {
    const eventDate = lastDiet.eventDate.toDate
      ? lastDiet.eventDate.toDate()
      : new Date(lastDiet.eventDate)
    daysSince = daysBetween(eventDate, new Date())
    lastDateString = eventDate.toLocaleDateString()
    brandName = lastDiet.brandName ?? ''
    foodType = lastDiet.foodType ?? ''
    quantity = lastDiet.quantity ?? 0
  } else {
    daysSince = Infinity
  }

  let finalMessage = customMessage
  if (!finalMessage) {
    const userName = userDoc?.full_name || 'there'
    const dogName = dogDoc?.name || 'your dog'
    const dogBreed = dogDoc?.breed || ''

    const prompt = buildDietPrompt(
      userName,
      dogName,
      dogBreed,
      brandName,
      foodType,
      quantity,
      lastDateString,
      daysSince
    )
    console.log('[createDietNotification] Prompt ->', prompt)

    finalMessage = await generateNotificationMessage(prompt)
  }

  const docRef = await addDoc(collection(db, 'notifications'), {
    userId,
    dogId,
    title: 'Diet Update Reminder',
    message: finalMessage,
    read: false,
    type: 'diet',
    createdAt: new Date(),
  })

  return {
    id: docRef.id,
    userId,
    dogId,
    title: 'Diet Update Reminder',
    message: finalMessage,
    read: false,
    type: 'diet',
    createdAt: new Date(),
  }
}

/**
 * createExerciseNotification: fetches dogDoc and uses fetchLastExerciseEventByRefs
 */
export async function createExerciseNotification(
  userId: string,
  dogId: string,
  customMessage?: string
): Promise<NotificationDoc> {
  const userDoc = await fetchUserData(userId)
  console.log('[createExerciseNotification] userDoc ->', userDoc)

  const dogDoc = await fetchDogData(dogId)
  console.log('[createExerciseNotification] dogDoc ->', dogDoc)

  // Now referencing the new approach for exercise event references
  const lastExercise = await fetchLastExerciseEventByRefs(dogDoc)
  console.log('[createExerciseNotification] lastExercise ->', lastExercise)

  let daysSince = 0
  let activityType = ''
  let distance = 0
  let duration = 0
  let lastDateString = 'Unknown date'

  if (lastExercise?.eventDate) {
    const eventDate = lastExercise.eventDate.toDate
      ? lastExercise.eventDate.toDate()
      : new Date(lastExercise.eventDate)
    daysSince = daysBetween(eventDate, new Date())
    lastDateString = eventDate.toLocaleDateString()
    activityType = lastExercise.activityType ?? ''
    distance = lastExercise.distance ?? 0
    duration = lastExercise.duration ?? 0
  } else {
    daysSince = Infinity
  }

  let finalMessage = customMessage
  if (!finalMessage) {
    const userName = userDoc?.full_name || 'there'
    const dogName = dogDoc?.name || 'your dog'
    const dogBreed = dogDoc?.breed || ''

    const prompt = buildExercisePrompt(
      userName,
      dogName,
      dogBreed,
      activityType,
      distance,
      duration,
      lastDateString,
      daysSince
    )
    console.log('[createExerciseNotification] Prompt ->', prompt)

    finalMessage = await generateNotificationMessage(prompt)
  }

  const docRef = await addDoc(collection(db, 'notifications'), {
    userId,
    dogId,
    title: 'Exercise Reminder',
    message: finalMessage,
    read: false,
    type: 'exercise',
    createdAt: new Date(),
  })

  return {
    id: docRef.id,
    userId,
    dogId,
    title: 'Exercise Reminder',
    message: finalMessage,
    read: false,
    type: 'exercise',
    createdAt: new Date(),
  }
}

/**
 * Listing and Deletion remain the same
 */
export async function getAllNotificationsForUser(userId: string): Promise<NotificationDoc[]> {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as DocumentData
    return {
      id: d.id,
      userId: data.userId,
      dogId: data.dogId,
      title: data.title,
      message: data.message,
      read: data.read ?? false,
      type: data.type,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    }
  })
}

export async function deleteNotification(notificationId: string) {
  const ref = doc(db, 'notifications', notificationId)
  await deleteDoc(ref)
}
