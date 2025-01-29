import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { notificationId: string } }
) {
  const { notificationId } = params

  // TODO: Query Firebase for the notification with this ID
  // e.g., const docRef = doc(db, 'notifications', notificationId)
  // const docSnap = await getDoc(docRef)

  // For now, just return a dummy object
  return NextResponse.json({
    id: notificationId,
    title: 'Sample Notification',
    message: 'This is a single notification fetch example',
  })
}

// Example placeholder: update or mark notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: { notificationId: string } }
) {
  const { notificationId } = params
  const body = await request.json()

  // TODO: Update doc in Firebase
  // e.g., await updateDoc(doc(db, 'notifications', notificationId), { read: body.read })

  return NextResponse.json({
    success: true,
    message: 'Notification updated',
    notificationId,
  })
}