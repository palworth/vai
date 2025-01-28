"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import DietDashboard from "@/app/components/dashboards/DietDashboard"
import { useAuth } from "@/app/contexts/AuthContext"
import { collection, query, where, getDocs, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Dog {
  id: string
  name: string
}

export default function DietDashboardPage() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null)
  const { user } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchDogs = async () => {
      if (!user) return

      const dogIdFromParams = searchParams.get("dogId")

      if (dogIdFromParams) {
        setSelectedDogId(dogIdFromParams)
      } else {
        const dogsQuery = query(collection(db, "dogs"), where("users", "array-contains", doc(db, "users", user.uid)))
        const querySnapshot = await getDocs(dogsQuery)
        const dogsData = querySnapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name }))
        setDogs(dogsData)
        if (dogsData.length > 0) {
          setSelectedDogId(dogsData[0].id)
        }
      }
    }

    fetchDogs()
  }, [user, searchParams])

  const handleDogChange = (dogId: string) => {
    setSelectedDogId(dogId)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Diet Dashboard</h1>

      {dogs.length > 1 && !searchParams.get("dogId") && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Dog</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleDogChange} value={selectedDogId || undefined}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a dog" />
              </SelectTrigger>
              <SelectContent>
                {dogs.map((dog) => (
                  <SelectItem key={dog.id} value={dog.id}>
                    {dog.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {selectedDogId ? (
        <DietDashboard dogId={selectedDogId} />
      ) : (
        <div>Error: No dog selected</div>
      )}
    </div>
  )
}