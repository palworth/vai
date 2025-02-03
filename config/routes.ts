export const routes = {
    home: "/",
    explore: "/explore",
    profile: "/settings",
    behavior: "/behavior",
    exercise: "/exercise",
    diet: "/diet",
    wellness: "/wellness",
    health: "/health",
    courses: {
      meditation: "/courses/meditation",
      stress: "/courses/stress",
      emotions: "/courses/emotions",
    },
  } as const
  
  export type RouteKey = keyof typeof routes
  
  