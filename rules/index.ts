// rules/index.ts

import { checkAndCreateDietNotification } from './diet'
import { checkAndCreateExerciseNotification } from './exercise'
import { fetchAllUsers, fetchDogsForUser } from '@/lib/dbqueries'

/**
 * The main entry point for daily checks.
 * For each user -> for each dog -> run various rules.
 */
export async function runDailyNotificationChecks() {
  // 1) Grab all users
  const users = await fetchAllUsers()
  console.log(`Found ${users.length} users. Running daily checks...`)

  for (const user of users) {
    // 2) For each user, fetch their dogs
    const dogs = await fetchDogsForUser(user.id)
    console.log(`User ${user.id} has ${dogs.length} dogs.`)

    for (const dog of dogs) {
      // 3) Run the rules you care about
      await checkAndCreateDietNotification(user.id, dog.id)
      await checkAndCreateExerciseNotification(user.id, dog.id)
      // Potentially more: checkAndCreateHealthNotification, etc.
    }
  }
}
