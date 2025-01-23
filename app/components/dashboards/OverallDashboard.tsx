"use client"

import type React from "react"
import { useEffect, useState } from "react"
import ReactECharts from "echarts-for-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/app/contexts/AuthContext"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Dog {
  id: string
  name: string
  // Add other dog properties as needed
}

interface DashboardData {
  totalHealthScore: number
  activitySummary: any[]
  dietSummary: any[]
  wellnessSummary: any[]
}

const OverallDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const searchParams = useSearchParams()

  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null)
  const [selectedDogName, setSelectedDogName] = useState<string | null>(null)

  useEffect(() => {
    const fetchDogs = async () => {
      if (!user) {
        console.log("No user found, skipping dog fetch")
        return
      }
      const dogIdFromParams = searchParams.get("dogId")
      console.log("Dog ID from params:", dogIdFromParams)

      if (dogIdFromParams) {
        // Fetch the specific dog
        const dogDoc = await getDoc(doc(db, "dogs", dogIdFromParams))
        if (dogDoc.exists()) {
          const dogData = { id: dogDoc.id, ...dogDoc.data() } as Dog
          console.log("Fetched specific dog:", dogData)
          setDogs([dogData])
          setSelectedDogId(dogData.id)
          setSelectedDogName(dogData.name)
        } else {
          console.error("Dog not found for ID:", dogIdFromParams)
          setError("Dog not found")
        }
      } else {
        // Fetch all dogs for the user
        const dogsQuery = query(collection(db, "dogs"), where("users", "array-contains", doc(db, "users", user.uid)))
        const querySnapshot = await getDocs(dogsQuery)
        const dogsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Dog)
        console.log("Fetched dogs for user:", dogsData)
        setDogs(dogsData)
      }
    }

    fetchDogs()
  }, [user, searchParams])

  useEffect(() => {
    async function fetchData() {
      if (!user || !selectedDogId) {
        console.log("No user or selected dog, skipping data fetch")
        setIsLoading(false)
        return
      }

      try {
        console.log("Fetching dashboard data for dog:", selectedDogId)
        const res = await fetch(`/api/dashboard/overall?userId=${user.uid}&dogId=${selectedDogId}`)
        if (!res.ok) {
          throw new Error(`Failed to fetch dashboard data: ${res.status} ${res.statusText}`)
        }
        const result = await res.json()
        console.log("Fetched dashboard data:", result)
        setData(result)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("An error occurred while fetching dashboard data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [user, selectedDogId])

  const handleDogChange = (dogId: string) => {
    console.log("Dog selection changed to:", dogId)
    const selectedDog = dogs.find((dog) => dog.id === dogId)
    if (selectedDog) {
      setSelectedDogId(selectedDog.id)
      setSelectedDogName(selectedDog.name)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  // Calculate Health Score Trend Data
  const trendData = data
    ? [...(data.activitySummary || []), ...(data.dietSummary || []), ...(data.wellnessSummary || [])]
        .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
        .map((item) => ({
          name: new Date(item.eventDate).toLocaleDateString(),
          healthScore: calculateHealthScore(item),
        }))
    : []

  // ECharts Options
  const lineChartOptions = {
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: trendData.map((item) => item.name),
    },
    yAxis: {
      type: "value",
      name: "Health Score",
    },
    series: [
      {
        name: "Health Score",
        type: "line",
        data: trendData.map((item) => item.healthScore),
        smooth: true,
        lineStyle: {
          color: "#4caf50",
          width: 3,
        },
        areaStyle: {
          color: "rgba(76, 175, 80, 0.2)",
        },
      },
    ],
  }

  return (
    <div className="dashboard-container space-y-6">
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

      {selectedDogId && data ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Overall Health Score for {selectedDogName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">{data.totalHealthScore?.toFixed(1) || "N/A"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Health Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ReactECharts option={lineChartOptions} style={{ height: "300px", width: "100%" }} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Exercise Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Total Activities: {data.activitySummary?.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Diet Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Total Diet Events: {data.dietSummary?.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Wellness Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Total Wellness Events: {data.wellnessSummary?.length || 0}</p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent>
            <p>Please select a dog to view the dashboard.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper function to calculate health score (you may want to adjust this based on your specific requirements)
function calculateHealthScore(item: any): number {
  if (item.type === "exercise") {
    return Math.min((item.duration / 60) * 10, 100) // 1 hour of exercise = 100 score
  } else if (item.type === "diet") {
    return item.quantity > 0 ? 80 : 0 // Simplistic approach, adjust as needed
  } else if (item.type === "wellness") {
    return 100 - item.severity * 10 // Invert severity for wellness score
  }
  return 50 // Default score
}

export default OverallDashboard

