import { 
  createDietNotification, 
  createExerciseNotification, 
  createWellnessNotification, 
  createBehaviorNotification 
} from '@/lib/notifications'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Types for Firestore documents
interface User {
  id: string
}

interface Dog {
  id: string
  name: string
  users: string[] // Array of user IDs associated with this dog
}

export async function runDailyNotificationChecks() {
  console.log("Starting daily notification checks...")

  try {
    // 1) Get all users from the users collection
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const users: User[] = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<User, 'id'> // Avoid id conflicts by excluding it from the spread
    }))

    for (const user of users) {
      console.log(`Checking notifications for user: ${user.id}`)

      // 2) Fetch dogs for the user from the dogs collection
      const dogsSnapshot = await getDocs(collection(db, 'dogs'))
      const userDogs: Dog[] = dogsSnapshot.docs
        .map(doc => {
          const data = doc.data() as Omit<Dog, 'id'>
          return { id: doc.id, ...data } // Correctly assign id without conflicts
        })
        .filter(dog => dog.users && dog.users.includes(user.id))

      for (const dog of userDogs) {
        console.log(`Checking notifications for dog: ${dog.id} (${dog.name})`)

        // 3) Create diet notification based on rules
        try {
          await createDietNotification(user.id, dog.id)
        } catch (err) {
          console.error(`Failed to create diet notification for dog ${dog.name}:`, err)
        }

        // 4) Create exercise notification based on rules
        try {
          await createExerciseNotification(user.id, dog.id)
        } catch (err) {
          console.error(`Failed to create exercise notification for dog ${dog.name}:`, err)
        }

        // 5) Create wellness notification based on rules
        try {
          await createWellnessNotification(user.id, dog.id)
        } catch (err) {
          console.error(`Failed to create wellness notification for dog ${dog.name}:`, err)
        }

        // 6) Create behavior notification based on rules
        try {
          await createBehaviorNotification(user.id, dog.id)
        } catch (err) {
          console.error(`Failed to create behavior notification for dog ${dog.name}:`, err)
        }
      }
    }
  } catch (error) {
    console.error("Error running daily notification checks:", error)
  }

  console.log("Daily notification checks completed.")
}
