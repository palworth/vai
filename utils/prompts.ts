// utils/prompts.ts

/**
 * Builds a short, friendly prompt for diet reminders
 */
export function buildDietPrompt(
    userName: string,
    dogName: string,
    dogBreed: string,
    brandName: string,
    foodType: string,
    quantity: number,
    lastDateString: string,
    daysSince: number
  ): string {
    return `
  You are writing a short, friendly, human-like reminder for ${dogName}'s diet.
  Key info (but do NOT just list it verbatim):
  - Dog: ${dogName} (${dogBreed})
  - Last known meal: ${quantity} of ${brandName} (${foodType})
  - Logged about ${daysSince} day(s) ago, on ${lastDateString} 
  - Owner: ${userName || 'the owner'}
  
  Task:
  Compose a concise, warm message addressing ${userName || 'the owner'} directly,
  encouraging them to update ${dogName}'s diet info. 
  Avoid rigid database formatting and keep it natural: 
  like “on January 28” or “a few days ago.” 
  Do not say “Of course!” or “Here’s a short reminder.” 
  End with a gentle call to action for them to log or update the diet.
  `
  }
  
  /**
   * Builds a short, friendly prompt for exercise reminders
   */
  export function buildExercisePrompt(
    userName: string,
    dogName: string,
    dogBreed: string,
    activityType: string,
    distance: number,
    duration: number,
    lastDateString: string,
    daysSince: number
  ): string {
    return `
  You are writing a short, friendly reminder for ${dogName}'s exercise routine.
  Key info (but do NOT just list it verbatim):
  - Dog: ${dogName} (${dogBreed})
  - Last activity: ${activityType}, covering ${distance} mile(s) in ${duration} minute(s)
  - Logged about ${daysSince} day(s) ago, on ${lastDateString}
  - Owner: ${userName || 'the owner'}
  
  Task:
  Compose a concise, warm message addressing ${userName || 'the owner'} directly,
  encouraging them to keep ${dogName} active.
  Avoid rigid database formatting and keep it natural. 
  Do not say “Of course!” or “Here’s a short reminder.” 
  End with a friendly call to action to update or maintain ${dogName}'s exercise logs.
  `
  }
  
  /**
   * Builds a short prompt for wellness notifications
   */
  export function buildWellnessPrompt(
    userName: string,
    dogName: string,
    dogBreed: string,
    mentalState: string,
    severityLevel: number,
    lastDateString: string,
    daysSince: number
  ): string {
    return `
  You are writing a concise, friendly wellness reminder for ${dogName}.
  Key info:
  - Dog: ${dogName} (${dogBreed})
  - Mental state: ${mentalState}
  - Severity: ${severityLevel}
  - Last logged: ${lastDateString} (${daysSince} days ago)
  
  Task:
  Create a short message for ${userName || 'the owner'} to check ${dogName}'s wellness.
  Keep the tone friendly and supportive, and include a suggestion for tracking any changes.
  `
  }
  
  /**
   * Builds a short prompt for behavior notifications
   */
  export function buildBehaviorPrompt(
    userName: string,
    dogName: string,
    dogBreed: string,
    behaviorType: string,
    severityLevel: number,
    lastDateString: string,
    daysSince: number
  ): string {
    return `
  You are writing a concise, helpful reminder about ${dogName}'s behavior.
  Key info:
  - Dog: ${dogName} (${dogBreed})
  - Behavior: ${behaviorType}
  - Severity: ${severityLevel}
  - Last logged: ${lastDateString} (${daysSince} days ago)
  
  Task:
  Create a short, friendly message for ${userName || 'the owner'} suggesting they monitor or address ${dogName}'s behavior if needed.
  Encourage them to log updates if the behavior changes.
  `
  }
  