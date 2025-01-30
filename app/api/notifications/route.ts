// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAllNotificationsForUser, createNotification } from '@/lib/notifications'

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
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    /**
     * Expect body to have:
     * {
     *   userId: string,
     *   dogId: string,
     *   eventId?: string,
     *   eventCollection?: string,
     *   type: string,
     *   message?: string,
     *   title?: string,
     * }
     */
    const newNotif = await createNotification(body)
    return NextResponse.json({ success: true, notification: newNotif })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
