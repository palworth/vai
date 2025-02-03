"use client"

import { Home, Map, Bell } from "lucide-react"
import { findNavigationItem } from "@/utils/navigationUtils"
import { useRoutes } from "@/hooks/useRoutes"
import type { NavigationItem } from "../types"
import Link from "next/link"
import { filterNavigationItems } from "@/utils/navigationUtils"

interface BottomNavigationProps {
  items: NavigationItem[]
}

export function BottomNavigation({ items }: BottomNavigationProps) {
  const { getRoute } = useRoutes()
  const filteredItems = filterNavigationItems(items, "Explore")
  const katieItem = findNavigationItem(items, "Katie")

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between items-center">
          <Link href={getRoute("notifications")} className="flex flex-col items-center gap-1">
            <Bell className="w-6 h-6" />
            <span className="text-sm">Notifications</span>
          </Link>
          <Link href={getRoute("home")} className="flex flex-col items-center gap-1">
            <Map className="w-6 h-6" />
            <span className="text-sm">Map</span>
          </Link>

          {katieItem && (
            <Link href={getRoute(katieItem.href)} className="flex flex-col items-center gap-1">
              {katieItem.icon}
              <span className="text-sm">{katieItem.label}</span>
            </Link>
          )}

          <Link href={getRoute("home")} className="flex flex-col items-center gap-1">
            <Home className="w-6 h-6" />
            <span className="text-sm">Today</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

