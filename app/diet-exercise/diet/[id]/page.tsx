import { DietEventDetails } from "@/app/components/DietEventDetails"

export default function DietEventPage({ params }: { params: { id: string } }) {
  return <DietEventDetails id={params.id} />
}

