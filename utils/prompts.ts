// utils/prompts.ts

/**
 * Builds a short, human-like diet prompt that encourages a casual yet informative tone.
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
  Avoid rigid database formatting (e.g., “1/28/2025”); sound natural, 
  like “on January 28” or “a few days ago.” 
  Do not say “Of course!” or “Here’s a short reminder.” 
  End with a gentle call to action for them to log or update the diet.
  `
  }
  
  /**
   * Builds a short, human-like exercise prompt that also avoids sterile data listing.
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
  You are writing a short, friendly, human-like reminder for ${dogName}'s exercise routine.
  Key info (but do NOT just list it verbatim):
  - Dog: ${dogName} (${dogBreed})
  - Last activity: ${activityType}, about ${distance} mile(s) in ${duration} minute(s)
  - Logged about ${daysSince} day(s) ago, on ${lastDateString}
  - Owner: ${userName || 'the owner'}
  
  Task:
  Compose a concise, warm message addressing ${userName || 'the owner'} directly, 
  encouraging them to keep ${dogName} active. 
  Avoid rigid database formatting and keep it natural: 
  like “last recorded a few days ago” or “recently.” 
  Do not say “Of course!” or “Here’s a short reminder.” 
  End with a friendly call to action to update or maintain ${dogName}'s exercise logs.
  `
  }
  