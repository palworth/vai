import { BehaviorEventDetails } from "@/app/components/BehaviorEventDetails"

export default async function BehaviorEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <BehaviorEventDetails id={id} />
}

