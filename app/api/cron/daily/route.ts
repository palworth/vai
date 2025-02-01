import { NextRequest, NextResponse } from 'next/server'
import { runDailyNotificationChecks } from '@/rules'

export async function GET(request: NextRequest) {
  // Validate CRON_SECRET for security
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('Starting daily notification checks...')

    // Run the daily notification checks for all users and dogs
    await runDailyNotificationChecks()

    console.log('Daily notification checks completed successfully.')
    return NextResponse.json({
      success: true,
      message: 'Daily cron job executed successfully',
    })
  } catch (error: any) {
    console.error('Error during daily notification cron job:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
