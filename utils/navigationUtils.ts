import type { NavigationItem } from "../types"

export function filterNavigationItems(items: NavigationItem[], excludeLabel: string) {
  return items.filter((item) => item.label !== excludeLabel)
}

export function findNavigationItem(items: NavigationItem[], label: string) {
  return items.find((item) => item.label === label)
}

