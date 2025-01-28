"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import ReactECharts from "echarts-for-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/app/contexts/AuthContext"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Dog {
  id: string
  name: string
}

interface DashboardData {
  totalHealthScore: number
  activitySummary: any[]
  dietSummary: any[]
  wellnessSummary: any[]
}

const OverallDashboard: React.FC<{ dogId: string }> = ({ dogId }) => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        console.log("No user found, skipping data fetch")
        setIsLoading(false)
        return
      }

      try {
        console.log("Fetching dashboard data for dog:", dogId)
        const res = await fetch(`/api/dashboard/overall?userId=${user.uid}&dogId=${dogId}`)
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
  }, [user, dogId])

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
      {data ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Overall Health Score</CardTitle>
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
            <p>No data available for the selected dog.</p>
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

