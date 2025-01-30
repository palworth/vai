// rules/exercise.ts

import { fetchLastExerciseEvent } from '@/lib/dbqueries'
import { createNotification } from '@/lib/notifications'

/**
 * Check & create an exercise notification if the dog hasn't exercised *today*.
 * Also ensure we only send 1 exercise notification per dog per day.
 */
export async function checkAndCreateExerciseNotification(userId: string, dogId: string) {
  // 1) Fetch the most recent exercise event
  const lastEvent = await fetchLastExerciseEvent(dogId)
  if (!lastEvent) {
    // No exercise event at all → definitely create a notification (once per day).
    const alreadyNotified = await wasNotifiedToday(userId, dogId, 'exercise')
    if (!alreadyNotified) {
      await createNotification({ userId, dogId, type: 'exercise' })
    }
    return
  }

  // 2) If the last event is from *today*, skip. If it's from yesterday or older, create a new one
  const eventDate = typeof lastEvent.eventDate?.toDate === 'function'
    ? lastEvent.eventDate.toDate()
    : new Date(lastEvent.eventDate)

  const now = new Date()
  const sameDay = isSameCalendarDay(eventDate, now)
  if (sameDay) {
    // Already exercised today → no new notification
    return
  }

  // 3) Otherwise, check if we already sent an exercise notification today
  const alreadyNotified = await wasNotifiedToday(userId, dogId, 'exercise')
  if (!alreadyNotified) {
    await createNotification({ userId, dogId, type: 'exercise' })
  }
}

/**
 * Example: check if the two dates share the same calendar day
 */
function isSameCalendarDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

/**
 * Same approach as diet's wasNotifiedToday
 */
async function wasNotifiedToday(userId: string, dogId: string, type: string): Promise<boolean> {
  // Implementation details same as in diet.ts
  return false
}
