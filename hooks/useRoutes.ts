import { useCallback } from "react";

export function useRoutes() {
  const getRoute = useCallback((route: string): string => {
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
        case "health-landing":
          return "/health-landing";
      case "diet":
        return "/diet";
      case "diet-schedule":
        return "/diet-schedule";
      case "poop-journal":
        return "/poop-journal";
      case "vet-landing":
        return "/vet-landing";
      case "diet-landing":
        return "diet-landing";
      // default route
      default:
        return "/";
    }
  }, []);

  return { getRoute };
}
