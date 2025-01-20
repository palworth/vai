import { ExerciseEventDetails } from "@/app/components/ExerciseEventDetails"

export default function ExerciseEventPage({ params }: { params: { id: string } }) {
  return <ExerciseEventDetails id={params.id} />
}

