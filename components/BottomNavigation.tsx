import { Plus } from "lucide-react"
import { filterNavigationItems, findNavigationItem } from "@/utils/navigationUtils"
import type { NavigationItem } from "../types"

interface BottomNavigationProps {
  items: NavigationItem[]
}

export function BottomNavigation({ items }: BottomNavigationProps) {
  const filteredItems = filterNavigationItems(items, "Explore")
  const katieItem = findNavigationItem(items, "Katie")

  return (
    <div className="mt-auto border-t">
      <div className="flex justify-between items-center px-12 py-4">
        <button className="flex flex-col items-center gap-1">
          {filteredItems[0].icon}
          <span className="text-sm">{filteredItems[0].label}</span>
        </button>

        {katieItem && (
          <button className="flex flex-col items-center gap-1">
            {katieItem.icon}
            <span className="text-sm">{katieItem.label}</span>
          </button>
        )}

        <button className="flex flex-col items-center gap-1">
          <Plus className="w-6 h-6" />
          <span className="text-sm">Add</span>
        </button>
      </div>
    </div>
  )
}

