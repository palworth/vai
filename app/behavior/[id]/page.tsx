import { BehaviorEventDetails } from "@/app/components/BehaviorEventDetails"

export default function BehaviorEventPage({ params }: { params: { id: string } }) {
  return <BehaviorEventDetails id={params.id} />
}

