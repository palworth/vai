import csv
from firebase_admin import firestore, credentials, initialize_app
from datetime import datetime
import os

# Firebase initialization
cred = credentials.Certificate(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
initialize_app(cred)
db = firestore.client()

def ensure_output_directory():
    os.makedirs("app/scripts/outputs", exist_ok=True)

def format_timestamp(ts):
    """Helper function to format Firestore timestamps and ISO 8601 strings."""
    if hasattr(ts, "isoformat"):  # Firestore Timestamp
        return ts.isoformat()
    elif isinstance(ts, str):  # ISO 8601 string
        try:
            return datetime.fromisoformat(ts).isoformat()
        except ValueError:
            return ""  # Leave blank for invalid strings
    return ""  # Leave blank if the field is missing

def fetch_and_write_csv():
    try:
        ensure_output_directory()

        # Fetch users
        users_ref = db.collection("users").stream()
        with open("app/scripts/outputs/users.csv", "w", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(["User ID", "Full Name", "Email", "ZIP Code", "Dog IDs", "CreatedAt", "UpdatedAt"])
            for user in users_ref:
                try:
                    user_data = user.to_dict()
                    full_name = user_data.get("full_name", "")
                    if not full_name:
                        continue

                    email = user_data.get("email", "")
                    zip_code = user_data.get("address", {}).get("zip", "")

                    # Handle createdAt and updatedAt
                    created_at = format_timestamp(user_data.get("createdAt"))
                    updated_at = format_timestamp(user_data.get("updatedAt"))

                    # Process Dog IDs
                    dog_ids = ",".join(
                        [dog.path if isinstance(dog, firestore.DocumentReference) else str(dog) for dog in user_data.get("dogList", [])]
                    ) if "dogList" in user_data else ""

                    writer.writerow([user.id, full_name, email, zip_code, dog_ids, created_at, updated_at])
                except Exception as e:
                    print(f"Error processing user {user.id}: {e}")

        # Fetch dogs
        dogs_ref = db.collection("dogs").stream()
        with open("app/scripts/outputs/dogs.csv", "w", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(["Dog ID", "Name", "Age", "Breed", "Sex", "Weight", "Birthday", "User IDs",
                             "Behavior Event IDs", "Diet Event IDs", "Exercise Event IDs", "Health Event IDs", "CreatedAt", "UpdatedAt"])
            for dog in dogs_ref:
                try:
                    dog_data = dog.to_dict()
                    name = dog_data.get("name", "")
                    age = dog_data.get("age", "")
                    breed = dog_data.get("breed", "")
                    sex = dog_data.get("sex", "")
                    weight = dog_data.get("weight", "")

                    # Handle birthday, createdAt, and updatedAt
                    birthday = format_timestamp(dog_data.get("birthday"))
                    created_at = format_timestamp(dog_data.get("createdAt"))
                    updated_at = format_timestamp(dog_data.get("updatedAt"))

                    # Convert Firestore DocumentReferences to paths for users
                    raw_users = dog_data.get("users", [])
                    user_ids = ",".join(
                        [user.path if isinstance(user, firestore.DocumentReference) else str(user) for user in raw_users]
                    )

                    # Process individual event fields
                    behavior_event_ids = ",".join(
                        [event.path if isinstance(event, firestore.DocumentReference) else str(event)
                         for event in dog_data.get("behaviorEventIds", [])]
                    )
                    diet_event_ids = ",".join(
                        [event.path if isinstance(event, firestore.DocumentReference) else str(event)
                         for event in dog_data.get("dietEventIds", [])]
                    )
                    exercise_event_ids = ",".join(
                        [event.path if isinstance(event, firestore.DocumentReference) else str(event)
                         for event in dog_data.get("exerciseEventIds", [])]
                    )
                    health_event_ids = ",".join(
                        [event.path if isinstance(event, firestore.DocumentReference) else str(event)
                         for event in dog_data.get("healthEventIds", [])]
                    )

                    # Write to CSV
                    writer.writerow([dog.id, name, age, breed, sex, weight, birthday, user_ids,
                                     behavior_event_ids, diet_event_ids, exercise_event_ids, health_event_ids,
                                     created_at, updated_at])
                except Exception as e:
                    print(f"Error processing dog {dog.id}: {e}")

        # Fetch events for each type and create individual CSVs
        event_types = {
            "behaviorEvents": ["Event ID", "User ID", "Dog ID", "CreatedAt", "UpdatedAt", "Details"],
            "dietEvents": ["Event ID", "User ID", "Dog ID", "CreatedAt", "UpdatedAt", "Details"],
            "exerciseEvents": ["Event ID", "User ID", "Dog ID", "CreatedAt", "UpdatedAt", "Details"],
            "healthEvents": ["Event ID", "User ID", "Dog ID", "CreatedAt", "UpdatedAt", "Details"]
        }

        for event_type, headers in event_types.items():
            with open(f"app/scripts/outputs/{event_type}.csv", "w", newline="") as file:
                writer = csv.writer(file)
                writer.writerow(headers)

                events_ref = db.collection(event_type).stream()
                for event in events_ref:
                    try:
                        event_data = event.to_dict()

                        # Extract createdAt and updatedAt from the event data
                        created_at = format_timestamp(event_data.get("createdAt"))
                        updated_at = format_timestamp(event_data.get("updatedAt"))

                        # Remove createdAt and updatedAt from the details
                        event_data.pop("createdAt", None)
                        event_data.pop("updatedAt", None)

                        # Convert Firestore references to string paths
                        user_id = event_data.get("userId")
                        if isinstance(user_id, firestore.DocumentReference):
                            user_id = user_id.path

                        dog_id = event_data.get("dogId")
                        if isinstance(dog_id, firestore.DocumentReference):
                            dog_id = dog_id.path

                        # Add 'type' as the first item in Details
                        event_type_field = f"type: {event_data.get('type', '')}"
                        event_data.pop("type", None)  # Remove it from the remaining fields

                        # Extract remaining details
                        details = ", ".join(
                            [event_type_field] + 
                            [f"{key}: {value}" for key, value in event_data.items() if key not in ["userId", "dogId"]]
                        )
                        writer.writerow([event.id, user_id, dog_id, created_at, updated_at, details])
                    except Exception as e:
                        print(f"Error processing event {event.id} in {event_type}: {e}")

        print("Firebase data successfully exported to individual CSV files.")

    except Exception as e:
        print(f"Error exporting data to CSV: {e}")

if __name__ == "__main__":
    fetch_and_write_csv()
