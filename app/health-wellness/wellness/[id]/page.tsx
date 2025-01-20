import { WellnessEventDetails } from "@/app/components/WellnessEventDetails"

export default async function WellnessEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <WellnessEventDetails id={id} />
}

