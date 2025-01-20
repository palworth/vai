import { HealthEventDetails } from "@/app/components/HealthEventDetails"

export default async function HealthEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <HealthEventDetails id={id} />
}

