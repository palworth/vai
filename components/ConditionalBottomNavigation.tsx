"use client";

import { usePathname } from "next/navigation";
import { BottomNavigation } from "./bottom-navigation";
import { navigationItems } from "@/constants/navigation";

export function ConditionalBottomNavigation() {
  const pathname = usePathname();
  // Hide the bottom navigation on /login and /signup pages
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }
  return <BottomNavigation items={navigationItems} />;
}
