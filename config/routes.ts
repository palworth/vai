export const routes = {
    home: "/",
    profile: "/settings",
    dogs: "/dogs",
    notifications:"/notifications",
    //Routes to event pages:
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
  
  