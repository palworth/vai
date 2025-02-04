export type DataItem = {
    eventDate: string
    dogName?: string
  } & (
    | {
        type: "behavior"
        behaviorType: string
        severity: number
        notes: string
      }
    | {
        type: "exercise"
        activityType: string
        source: string
        distance: number
        duration: number
      }
    | {
        type: "diet"
        foodType: string
        brandName: string
        quantity: number
      }
    | {
        type: "wellness"
        mentalState: string
        severity: number
        notes: string
      }
    | {
        type: "health"
        eventType: string
        severity: number
        notes: string
      }
  )
  
  export const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  
  