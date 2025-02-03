import { SearchBar } from "@/components/search-bar"
import { EventGrid } from "@/components/event-grid"
import { GuidedProgramCard } from "@/components/guided-program-card"
import { CourseList } from "@/components/course-list"
import { BottomNavigation } from "@/components/bottom-navigation"
import { FloatingActionButton } from "@/components/floating-action-button"
import { navigationItems, events, featuredProgram, courses } from "@/constants/navigation"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      <div className="flex-grow overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar />
          <div className="pt-16 pb-20">
            <EventGrid events={events} />
            <GuidedProgramCard program={featuredProgram} />
            <CourseList courses={courses} />
          </div>
        </div>
      </div>
      <BottomNavigation items={navigationItems} />
      <FloatingActionButton />
    </div>
  )
}

