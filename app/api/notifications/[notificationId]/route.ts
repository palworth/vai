// app/api/notifications/[notificationId]/route.ts
import { NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { deleteNotification } from '@/lib/notifications'

export async function GET(request: Request, context: any) {
  const { notificationId } = context.params
  try {
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

export async function DELETE(request: Request, context: any) {
  const { notificationId } = context.params
  try {
    await deleteNotification(notificationId)
    return NextResponse.json({ success: true, message: 'Notification deleted' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
