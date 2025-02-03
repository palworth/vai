import { useCallback } from "react"
import { routes, type RouteKey } from "@/config/routes"

export function useRoutes() {
  const getRoute = useCallback((key: RouteKey | string) => {
    if (key in routes) {
      return routes[key as RouteKey]
    }
    // If the key is not in routes, return it as is (assuming it's a valid path)
    return key
  }, [])

  return { routes, getRoute }
}

