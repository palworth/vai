import OverallDashboard from "@/app/components/dashboards/OverallDashboard"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Pet Health Dashboard</h1>
      <OverallDashboard />
    </div>
  )
}

