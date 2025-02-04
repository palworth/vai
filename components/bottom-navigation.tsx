"use client";

import { useRoutes } from "@/hooks/useRoutes";
import type { NavigationItem } from "../types";
import Link from "next/link";
import { navigationItems } from "@/constants/navigation";

interface BottomNavigationProps {
  // Now optional – since we can get the items from constants.
  // If you want to allow overriding, you can still accept items.
  items?: NavigationItem[];
}

export function BottomNavigation({ items }: BottomNavigationProps) {
  const { getRoute } = useRoutes();
  // Use items from props if provided; otherwise default to navigationItems from constants.
  const navItems = items || navigationItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between items-center">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-1 text-black"
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
