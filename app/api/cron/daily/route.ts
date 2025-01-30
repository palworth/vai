import { NextRequest, NextResponse } from 'next/server'
import { runDailyNotificationChecks } from '@/rules' // optional

export async function GET(request: NextRequest) {
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    // await runDailyNotificationChecks()
    return NextResponse.json({
      success: true,
      message: 'Daily cron job executed successfully',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
