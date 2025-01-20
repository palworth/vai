import { WellnessEventDetails } from "@/app/components/WellnessEventDetails"

export default function WellnessEventPage({ params }: { params: { id: string } }) {
  return <WellnessEventDetails id={params.id} />
}

