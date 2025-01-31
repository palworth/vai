// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  getAllNotificationsForUser,
  createDietNotification,
  createExerciseNotification,
  createWellnessNotification, 
  createBehaviorNotification
} from '@/lib/notifications'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    const notifications = await getAllNotificationsForUser(userId)
    return NextResponse.json({ notifications })
  } catch (err: any) {
    console.error('GET /api/notifications error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, dogId, type, message } = body

    if (!userId || !dogId || !type) {
      return NextResponse.json({ error: 'Missing userId, dogId, or type' }, { status: 400 })
    }

    let notification
    switch (type) {
      case 'diet':
        notification = await createDietNotification(userId, dogId, message)
        break
      case 'exercise':
        notification = await createExerciseNotification(userId, dogId, message)
        break
        case 'wellness':
        notification = await createWellnessNotification(userId, dogId, message)
        break
      case 'behavior':
        notification = await createBehaviorNotification(userId, dogId, message)
        break
      default:
        return NextResponse.json({ error: 'Unsupported notification type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, notification })
  } catch (err: any) {
    console.error('POST /api/notifications error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
