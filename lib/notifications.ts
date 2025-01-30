// lib/notifications.ts

import { db } from '@/lib/firebase'
import { collection, addDoc, doc, deleteDoc, query, where, getDocs, DocumentData } from 'firebase/firestore'
import { generateNotificationMessage } from '@/lib/openai'

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

export interface CreateNotificationProps {
  userId: string
  dogId: string
  type: string // diet, exercise, etc.
  message?: string
  title?: string
}

/**
 * Creates a new notification doc in Firestore. If `message` isn't provided, we generate one using OpenAI.
 */
export async function createNotification({
  userId,
  dogId,
  type,
  message,
  title
}: CreateNotificationProps): Promise<NotificationDoc> {
  // If no message, we do a quick switch for a simple prompt
  let finalMessage = message
  if (!finalMessage) {
    let prompt = ''
    switch (type) {
      case 'diet':
        prompt = `It's time to update your dog's diet! Give them a balanced meal to keep them healthy.`
        break
      case 'exercise':
        prompt = `Your dog could use some exercise! Consider a walk or play session today.`
        break
      default:
        prompt = `This is a generic notification for your dog.`
        break
    }
    finalMessage = await generateNotificationMessage(prompt)
  }

  const docRef = await addDoc(collection(db, 'notifications'), {
    userId,
    dogId,
    title: title || 'Notification',
    message: finalMessage,
    read: false,
    type,
    createdAt: new Date()
  })

  return {
    id: docRef.id,
    userId,
    dogId,
    title: title || 'Notification',
    message: finalMessage,
    read: false,
    type,
    createdAt: new Date()
  }
}

/**
 * Example listing notifications for a user
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
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
    }
  })
}

/**
 * Deletion snippet
 */
export async function deleteNotification(notificationId: string) {
  const ref = doc(db, 'notifications', notificationId)
  await deleteDoc(ref)
}
