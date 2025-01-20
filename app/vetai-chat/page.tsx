"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/contexts/AuthContext"
import { ChatWindow } from "@/app/components/ChatWindow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, query, where, getDocs, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Dog {
  id: string
  name: string
  breed: string
  age: number
  weight: number
}

export default function VetAIChat() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchUserDogs()
    }
  }, [user])

  const fetchUserDogs = async () => {
    if (!user) return
    const dogsQuery = query(collection(db, "dogs"), where("users", "array-contains", doc(db, "users", user.uid)))
    const querySnapshot = await getDocs(dogsQuery)
    const dogsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Dog)
    setDogs(dogsData)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">VetAI Chat</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <ChatWindow />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Dogs</CardTitle>
            </CardHeader>
            <CardContent>
              {dogs.map((dog) => (
                <div key={dog.id} className="mb-4">
                  <h3 className="font-semibold">{dog.name}</h3>
                  <p>Breed: {dog.breed}</p>
                  <p>Age: {dog.age} years</p>
                  <p>Weight: {dog.weight} lbs</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

