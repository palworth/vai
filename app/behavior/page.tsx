'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function Behavior() {
  return (
    <div className="h-full bg-gray-100">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Behavior Management</CardTitle>
            <CardDescription>Manage your dog&apos;s behavior and training</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/behavior/add" passHref>
                <Button className="w-full sm:w-auto">Add Behavior Event</Button>
              </Link>
              <Link href="/behavior/training/add" passHref>
                <Button className="w-full sm:w-auto">Add Training Plan</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

