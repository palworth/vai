import { ExerciseEventDetails } from "@/app/components/ExerciseEventDetails"

export default async function ExerciseEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ExerciseEventDetails id={id} />
}


