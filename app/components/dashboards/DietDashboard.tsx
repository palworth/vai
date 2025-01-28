"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import ReactECharts from "echarts-for-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/app/contexts/AuthContext"
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Dog {
  id: string
  name: string
}

interface DietEvent {
  id: string
  eventDate: string | null
  foodType: string
  quantity: number
}

interface GroupedDietData {
  [foodType: string]: DietEvent[]
}

interface EChartsParams {
  seriesName: string
  data: [string, number]
  name: string
}

const DietDashboard: React.FC<{ dogId: string }> = ({ dogId }) => {
  const [dietData, setDietData] = useState<GroupedDietData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const searchParams = useSearchParams()

  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string | null>(dogId)
  const [selectedDogName, setSelectedDogName] = useState<string | null>(null)

  useEffect(() => {
    const fetchDogs = async () => {
      if (!user) {
        console.log("No user found, skipping dog fetch")
        return
      }
      const dogIdFromParams = searchParams.get("dogId") || dogId

      if (dogIdFromParams) {
        const dogDoc = await getDoc(doc(db, "dogs", dogIdFromParams))
        if (dogDoc.exists()) {
          const dogData = { id: dogDoc.id, ...dogDoc.data() } as Dog
          setDogs([dogData])
          setSelectedDogId(dogData.id)
          setSelectedDogName(dogData.name)
        } else {
          console.error("Dog not found for ID:", dogIdFromParams)
          setError("Dog not found")
        }
      } else {
        const dogsQuery = query(collection(db, "dogs"), where("users", "array-contains", doc(db, "users", user.uid)))
        const querySnapshot = await getDocs(dogsQuery)
        const dogsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Dog)
        setDogs(dogsData)
        if (dogsData.length > 0) {
          setSelectedDogId(dogsData[0].id)
          setSelectedDogName(dogsData[0].name)
        }
      }
    }

    fetchDogs()
  }, [user, searchParams, dogId])

  useEffect(() => {
    const fetchDietData = async () => {
      if (!user || !selectedDogId) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/dashboard/diet?dogId=${selectedDogId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch diet data")
        }
        const data = await response.json()
        setDietData(data)
      } catch (err) {
        console.error("Error fetching diet data:", err)
        setError("An error occurred while fetching diet data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDietData()
  }, [user, selectedDogId])

  const handleDogChange = (dogId: string) => {
    setSelectedDogId(dogId)
    const selectedDog = dogs.find((dog) => dog.id === dogId)
    if (selectedDog) {
      setSelectedDogName(selectedDog.name)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!selectedDogId) return <div>Please select a dog to view the diet dashboard.</div>
  if (!dietData) return <div>No diet data available for the selected dog.</div>

  const foodTypes = Object.keys(dietData)
  const colors = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
  ]

  const option = {
    title: {
      text: "Diet Quantity Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis" as const,
      formatter: (params: EChartsParams[]) => {
        const date = new Date(params[0].data[0]).toLocaleDateString()
        let result = `${date}<br/>`
        params.forEach((param) => {
          result += `${param.seriesName}: ${param.data[1]}g<br/>`
        })
        return result
      },
    },
    legend: {
      data: foodTypes,
      orient: "vertical" as const,
      right: 10,
      top: "center",
    },
    xAxis: {
      type: "time" as const,
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: "value" as const,
      name: "Quantity (g)",
      nameLocation: "middle" as const,
      nameGap: 50,
      splitLine: {
        show: true,
      },
    },
    series: foodTypes.map((foodType, index) => ({
      name: foodType,
      type: "line",
      showSymbol: false,
      data: dietData[foodType]
        .filter((event) => event.eventDate !== null)
        .map((event) => [event.eventDate, event.quantity]),
      color: colors[index % colors.length],
    })),
  }

  return (
    <div className="dashboard-container space-y-6">
      {dogs.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Dog</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleDogChange} value={selectedDogId || undefined}>
              <SelectTrigger>
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

      <Card>
        <CardHeader>
          <CardTitle>Diet Dashboard for {selectedDogName}</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={option} style={{ height: "400px" }} />
        </CardContent>
      </Card>
    </div>
  )
}

export default DietDashboard