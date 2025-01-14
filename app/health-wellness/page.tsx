'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HealthWellness() {
 return (
   <div className="h-full bg-gray-100">
     <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
       <Card>
         <CardHeader>
           <CardTitle>Monitor Health Events and Wellness</CardTitle>
           <CardDescription>Track and manage your dog&apos;s health and well-being</CardDescription>
         </CardHeader>
         <CardContent>
           <div className="flex flex-col sm:flex-row gap-4">
             <Link href="/health-wellness/add" passHref>
               <Button className="w-full sm:w-auto">Add Health Event</Button>
             </Link>
             <Button className="w-full sm:w-auto" onClick={() => console.log('Wellness Check-in button clicked')}>
               Add Wellness Check-in
             </Button>
           </div>
         </CardContent>
       </Card>
     </main>
   </div>
 )
}

