import { DietEventDetails } from "@/app/components/DietEventDetails"

export default async function DietEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DietEventDetails id={id} />
}

