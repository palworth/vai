import json
import csv
import os
from google.cloud import storage
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Change to DEBUG for more granular logs
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# Paths and configurations
JSONL_FILES = [
    "app/scripts/outputs/users.jsonl",
    "app/scripts/outputs/dogs.jsonl",
    "app/scripts/outputs/healthEvents.jsonl",
    "app/scripts/outputs/exerciseEvents.jsonl",
    "app/scripts/outputs/dietEvents.jsonl"
]
OUTPUT_CSV = "app/scripts/outputs/dog_data.csv"
GCS_BUCKET_NAME = "firestore-batch-boi"
GCS_OUTPUT_FILE = "dog_data.csv"

# Helper functions
def load_jsonl(file_path):
    """Loads JSONL data from a file."""
    try:
        with open(file_path, "r") as file:
            return [json.loads(line) for line in file]
    except Exception as e:
        logging.error(f"Error reading {file_path}: {e}")
        return []

def upload_to_gcs(local_file_path, bucket_name, destination_blob_name):
    """Uploads a file to Google Cloud Storage."""
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_filename(local_file_path)
        logging.info(f"CSV file successfully uploaded to gs://{bucket_name}/{destination_blob_name}")
    except Exception as e:
        logging.error(f"Failed to upload file to GCS: {e}")

# Main processing
def process_jsonl_to_csv():
    """Processes JSONL files and generates a CSV with event_details."""
    try:
        # Load data from JSONL files
        users = {user["id"]: user for user in load_jsonl(JSONL_FILES[0])}
        dogs = {dog["id"]: dog for dog in load_jsonl(JSONL_FILES[1])}
        health_events = load_jsonl(JSONL_FILES[2])
        exercise_events = load_jsonl(JSONL_FILES[3])
        diet_events = load_jsonl(JSONL_FILES[4])

        # Prepare CSV data
        csv_rows = [
            ["user_id", "dog_id", "event_type", "event_timestamp", "dog_name", "dog_age", "dog_breed", "dog_sex", "dog_weight", "user_email", "user_name", "event_details"]
        ]

        def add_event_to_csv(event, event_type):
            try:
                dog_id = event["dogId"].split("/")[-1]
                dog = dogs.get(dog_id, {})
                user_id = dog.get("users", ["N/A"])[0].split("/")[-1]
                user = users.get(user_id, {})

                csv_rows.append([
                    user_id,
                    dog_id,
                    event_type,
                    event.get("eventDate") or event.get("dateTime"),
                    dog.get("name", "N/A"),
                    dog.get("age", "N/A"),
                    dog.get("breed", "N/A"),
                    dog.get("sex", "N/A"),
                    dog.get("weight", "N/A"),
                    user.get("email", "N/A"),
                    user.get("name", "N/A"),
                    json.dumps(event, default=str)
                ])
            except Exception as e:
                logging.warning(f"Error processing event: {event}, Error: {e}")

        # Process events
        for event in health_events:
            add_event_to_csv(event, "health")
        for event in exercise_events:
            add_event_to_csv(event, "exercise")
        for event in diet_events:
            add_event_to_csv(event, "diet")

        # Write to CSV
        with open(OUTPUT_CSV, "w", newline="") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerows(csv_rows)

        logging.info(f"CSV file successfully saved to {OUTPUT_CSV}")

        # Upload CSV to GCS
        upload_to_gcs(OUTPUT_CSV, GCS_BUCKET_NAME, GCS_OUTPUT_FILE)

    except Exception as e:
        logging.error(f"Error during JSONL to CSV processing: {e}")

if __name__ == "__main__":
    logging.info("Starting JSONL to CSV processing")
    process_jsonl_to_csv()
