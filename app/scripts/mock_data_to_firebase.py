import random
from datetime import datetime, timedelta
import os
from firebase_admin import firestore, credentials, initialize_app
from constants import ACTIVITY_TYPES, SOURCES, FOOD_TYPES, BREEDS, ZIP_CODES, NAMES, DOG_NAMES, BEHAVIOR_TYPES, BEHAVIOR_NOTES, DIET_BRANDS, HEALTH_EVENT_TYPES, HEALTH_NOTES


# Firebase initialization
cred = credentials.Certificate(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
initialize_app(cred)
db = firestore.client()

# List to store references of created data
created_items = []

def get_random_element(array):
    return random.choice(array)

def ensure_output_directory():
    os.makedirs("app/scripts/outputs", exist_ok=True)

def write_created_items():
    try:
        ensure_output_directory()
        with open("app/scripts/outputs/created_items.json", "w") as file:
            import json
            json.dump(created_items, file, indent=4)
        print("created_items.json successfully written.")
    except Exception as e:
        print(f"Error writing created_items.json: {e}")

def generate_random_users():
    users = []
    for i in range(10):
        real_name = get_random_element(NAMES)
        updated_at = datetime.now() - timedelta(days=random.randint(0, 365))
        created_at = updated_at - timedelta(days=random.randint(1, 10))
        created_at = updated_at - timedelta(days=random.randint(1, 10))
        users.append({
            "full_name": f"T-{real_name}",
            "email": f"t-{real_name.lower()}@example.com",
            "address": {
                "zip": get_random_element(ZIP_CODES)
            },
            "dogList": [],
            "createdAt": created_at.isoformat(),
            "updatedAt": updated_at.isoformat()
        })
    return users

def generate_random_dog_events(dog_ref, user_ref):
    events = []
    event_ids = {
        "behavior": [],
        "diet": [],
        "exercise": [],
        "health": []
    }

    for _ in range(30):
        event_type = get_random_element(["behavior", "diet", "exercise", "health"])
        created_at = datetime.now() - timedelta(days=random.randint(0, 365))
        updated_at = created_at + timedelta(days=random.randint(0, 10))  # Updates occur within 10 days of creation

        event = {
            "type": event_type,
            "userId": user_ref,
            "dogId": dog_ref,
            "createdAt": created_at,
            "updatedAt": updated_at
        }

        if event_type == "behavior":
            event.update({
                "behaviorType": get_random_element(BEHAVIOR_TYPES),
                "severity": random.randint(1, 10),
                "notes": get_random_element(BEHAVIOR_NOTES)
            })
        elif event_type == "diet":
            event.update({
                "brandName": get_random_element(DIET_BRANDS),  # Randomize brandName
                "foodType": get_random_element(FOOD_TYPES),  # Randomize foodType
                "quantity": random.randint(100, 500)  # Keep quantity random
            })
        elif event_type == "exercise":
            event.update({
                "activityType": get_random_element(ACTIVITY_TYPES),  # Randomize activityType
                "source": get_random_element(SOURCES),  # Randomize source
                "distance": round(random.uniform(0.5, 5.0), 2),  # Keep distance random
                "duration": random.randint(10, 120)  # Keep duration random
            })
        elif event_type == "health":
            event.update({
                "eventType": get_random_element(HEALTH_EVENT_TYPES),  # Randomize eventType
                "severity": random.randint(1, 10),
                "notes": get_random_element(HEALTH_NOTES)  # Randomize notes
            })

        event_ref = db.collection(f"{event_type}Events").add(event)
        event_path = db.document(f"{event_type}Events/{event_ref[1].id}")
        event_ids[event_type].append(event_path)  # Store as a reference
        created_items.append({"collection": f"{event_type}Events", "id": event_ref[1].id})
        print(f"Event created: {event_ref[1].id} in {event_type}Events")

    return event_ids

def add_mock_data():
    try:
        ensure_output_directory()
        users = generate_random_users()

        for user in users:
            user_ref = db.collection("users").add(user)
            user_id = user_ref[1].id
            user_reference = db.document(f"users/{user_id}")
            created_items.append({"collection": "users", "id": user_id})
            print(f"User added: {user_id}")

            num_dogs = random.randint(1, 3)
            dog_ids = []

            for i in range(num_dogs):
                dog_name = get_random_element(DOG_NAMES)
                dog = {
                    "users": [user_reference],  # Use the Firestore reference directly
                    "name": dog_name,
                    "age": random.randint(1, 10),
                    "breed": get_random_element(BREEDS),
                    "sex": get_random_element(["Male", "Female"]),
                    "weight": f"{random.randint(10, 40)} lbs",
                    "birthday": (datetime.now() - timedelta(days=random.randint(365, 3650))).isoformat(),
                    "createdAt": datetime.now().isoformat(),
                    "updatedAt": datetime.now().isoformat(),
                    "behaviorEventIds": [],
                    "dietEventIds": [],
                    "exerciseEventIds": [],
                    "healthEventIds": []
                }

                dog_ref = db.collection("dogs").add(dog)
                dog_id = dog_ref[1].id
                dog_reference = db.document(f"dogs/{dog_id}")
                created_items.append({"collection": "dogs", "id": dog_id})
                print(f"Dog added: {dog_id}")
                dog_ids.append(dog_reference)

                event_ids = generate_random_dog_events(dog_reference, user_reference)
                db.collection("dogs").document(dog_id).update({
                    "behaviorEventIds": event_ids["behavior"],
                    "dietEventIds": event_ids["diet"],
                    "exerciseEventIds": event_ids["exercise"],
                    "healthEventIds": event_ids["health"]
                })

            db.collection("users").document(user_id).update({"dogList": dog_ids})

        write_created_items()

        print("Mock data successfully added to Firestore.")
    except Exception as e:
        print(f"Error adding mock data: {e}")

if __name__ == "__main__":
    add_mock_data()
