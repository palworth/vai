import { HealthEventDetails } from "@/app/components/HealthEventDetails"

export default function HealthEventPage({ params }: { params: { id: string } }) {
  return <HealthEventDetails id={params.id} />
}

