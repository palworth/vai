// app/api/notifications/[notificationId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { deleteNotification, /* getNotification */ } from '@/lib/notifications'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET(
  request: NextRequest,
  { params }: { params: { notificationId: string } }
) {
  const { notificationId } = params
  try {
    // Example direct fetch (or you can implement getNotification in notifications.ts)
    const ref = doc(db, 'notifications', notificationId)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }
    const data = snap.data()
    return NextResponse.json({ id: snap.id, ...data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { notificationId: string } }
) {
  const { notificationId } = params
  try {
    await deleteNotification(notificationId)
    return NextResponse.json({ success: true, message: 'Notification deleted' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
