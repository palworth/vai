'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'

interface Dog {
  id: string
  name: string
  breed: string
  age: number
  sex: string
  weight: number
}

export default function DogsPage() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const { user } = useAuth()

  const fetchDogs = useCallback(async () => {
    if (!user) return
    const dogsQuery = query(collection(db, 'dogs'), where('users', 'array-contains', user.uid))
    const querySnapshot = await getDocs(dogsQuery)
    const dogsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dog))
    setDogs(dogsData)
  }, [user])

  useEffect(() => {
    if (user) {
      fetchDogs()
    }
  }, [user, fetchDogs])

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Dogs</h1>
          <Link href="/dogs/add">
            <Button>Add New Dog</Button>
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dogs.map((dog) => (
            <Link href={`/dogs/${dog.id}`} key={dog.id}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{dog.name}</CardTitle>
                  <CardDescription>{dog.breed}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Age: {dog.age}</p>
                  <p>Sex: {dog.sex}</p>
                  <p>Weight: {dog.weight} lbs</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

