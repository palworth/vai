import { Card } from "@/components/ui/card"
import { InstructorInfo } from "@/components/InstructorInfo"
import type { GuidedProgram } from "../types"

interface GuidedProgramCardProps {
  program: GuidedProgram
}

export function GuidedProgramCard({ program }: GuidedProgramCardProps) {
  return (
    <Card className="bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-white rounded-full text-sm text-gray-600">{program.tag}</span>
          <h2 className="text-2xl font-bold">{program.title}</h2>
          <div className="space-y-1 text-gray-600">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="currentColor" d="M21 3v18H3V3h18zm-1 1H4v16h16V4zM8 10h8v2H8v-2zm0 4h8v2H8v-2z" />
              </svg>
              <span>{program.level}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  fill="currentColor"
                  d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"
                />
              </svg>
              <span>{program.duration}</span>
            </div>
          </div>
        </div>
        <InstructorInfo name={program.instructor.name} />
      </div>
    </Card>
  )
}

