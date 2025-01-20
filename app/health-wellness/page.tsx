"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"

export default function HealthWellnessPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <PageHeader title="Health & Wellness" />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Health & Wellness Management</CardTitle>
            <CardDescription>Monitor and manage your dog&apos;s health and wellness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/health-wellness/health/add" passHref>
                <Button className="w-full">Add Health Event</Button>
              </Link>
              <Link href="/health-wellness/wellness/add" passHref>
                <Button className="w-full">Wellness Check-in</Button>
              </Link>
              <Link href="/health-wellness/records" passHref>
                <Button className="w-full" variant="outline">
                  View Health Records
                </Button>
              </Link>
              <Link href="/health-wellness/vet-appointments" passHref>
                <Button className="w-full" variant="outline">
                  Schedule Vet Appointment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Health Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No recent health events</p>
              <Link href="/health-wellness/health" passHref>
                <Button className="mt-4" variant="link">
                  View All Health Events
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wellness Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Wellness data visualization will be displayed here</p>
              <Link href="/health-wellness/wellness" passHref>
                <Button className="mt-4" variant="link">
                  View Detailed Wellness Report
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

