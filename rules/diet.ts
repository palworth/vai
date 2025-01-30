// rules/diet.ts

import { fetchLastDietEvent, daysBetween } from '@/lib/dbqueries'
import { createNotification } from '@/lib/notifications'

/**
 * Check & create a diet notification if no diet event in the last 15 days.
 * Also ensure we only create 1 diet notification per dog per day.
 */
export async function checkAndCreateDietNotification(userId: string, dogId: string) {
  // 1) Fetch the most recent diet event
  const lastEvent = await fetchLastDietEvent(dogId)
  let daysSinceLastEvent = Number.MAX_SAFE_INTEGER // default if no event

  if (lastEvent) {
    const lastDate = typeof lastEvent.eventDate?.toDate === 'function'
      ? lastEvent.eventDate.toDate()
      : new Date(lastEvent.eventDate)
    daysSinceLastEvent = daysBetween(lastDate, new Date())
  }

  // 2) Only create a diet reminder if > 15 days
  if (daysSinceLastEvent > 15) {
    // Also check if we already created a diet notification today
    const alreadyNotified = await wasNotifiedToday(userId, dogId, 'diet')
    if (alreadyNotified) {
      return
    }

    // 3) Create the notification
    await createNotification({ userId, dogId, type: 'diet' })
  }
}

/**
 * Example function to see if a dog already got a 'diet' notification today.
 * This prevents daily spam if user hasn't updated yet.
 */
async function wasNotifiedToday(userId: string, dogId: string, type: string): Promise<boolean> {
  // Implementation depends on how you want to check.
  // E.g., query 'notifications' for docs with userId, dogId, type, createdAt >= today's midnight
  // If found, return true. Otherwise, false.

  // PSEUDO CODE:
  // const startOfDay = new Date()
  // startOfDay.setHours(0, 0, 0, 0)
  // const q = query(
  //   collection(db, 'notifications'),
  //   where('userId', '==', userId),
  //   where('dogId', '==', dogId),
  //   where('type', '==', type),
  //   where('createdAt', '>=', startOfDay)
  // )
  // const snap = await getDocs(q)
  // return !snap.empty

  return false
}
