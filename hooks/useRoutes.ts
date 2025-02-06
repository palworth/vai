import { useCallback } from "react"

export function useRoutes() {
  const getRoute = (route: string): string => {
    switch (route) {
      // Nav bar routes
        case "dogs":
        return "/dogs";
      case "settings":
        return "/settings";
      case "notifications":
        return "/notifications";
      case "home":
        return "/";
      // event routes
      case "behavior":
        return "/behavior";
      case "exercise":
        return "/exercise";
      case "wellness":
        return "/wellness";
      case "health":
        return "/health";
      case "diet":
        return "/diet";
      
      // default route
        default:
        return "/";
    // ... other routes
    }
  };

  return { getRoute };
}

