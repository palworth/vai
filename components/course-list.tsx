import Link from "next/link"
import type { CourseCard } from "../types"
import { useRoutes } from "@/hooks/useRoutes"

interface CourseListProps {
  courses: CourseCard[]
}

export function CourseList({ courses }: CourseListProps) {
  const { getRoute } = useRoutes()

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <Link key={course.title} href={getRoute(course.href)} className="block">
          <div
            className="rounded-2xl p-6 h-24 relative overflow-hidden"
            style={{ backgroundColor: course.backgroundColor }}
          >
            <h3 className="text-white text-xl font-bold relative z-10">{course.title}</h3>
            {course.secondaryColor && (
              <div
                className="absolute bottom-0 right-0 w-24 h-24 rounded-full transform translate-x-8 translate-y-8"
                style={{ backgroundColor: course.secondaryColor }}
              />
            )}
            {course.decorativeElements}
          </div>
        </Link>
      ))}
    </div>
  )
}

