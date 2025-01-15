'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function DietExercise() {
  return (
    <div className="h-full bg-gray-100">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Diet and Exercise</CardTitle>
            <CardDescription>Manage your dog&apos;s diet and exercise routine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/diet-exercise/diet/add" passHref>
                <Button className="w-full sm:w-auto">Add Diet Entry</Button>
              </Link>
              <Button className="w-full sm:w-auto" onClick={() => console.log('Exercise log button clicked')}>
                Log Exercise
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

