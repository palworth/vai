import { useCallback } from "react"

export function useRoutes() {
  const getRoute = (route: string): string => {
    switch (route) {
      case "notifications":
        return "/notifications";
      case "home":
        return "/";
      // ... other routes
      default:
        return "/";
    }
  };

  return { getRoute };
}

