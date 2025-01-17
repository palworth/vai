from google.cloud import firestore, storage
from google.cloud.firestore_v1._helpers import DatetimeWithNanoseconds
import json
import os
import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Change to DEBUG for more granular logs
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# Path to your Google Cloud service account key file
SERVICE_ACCOUNT_KEY = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
# GCS bucket name
GCS_BUCKET_NAME = "firestore-batch-boi"

# Firestore collections to export
COLLECTIONS = ["users", "dogs", "healthEvents", "dietEvents", "exerciseEvents"]

# Directory to save JSONL files
OUTPUT_DIRECTORY = "app/scripts/outputs"

# Ensure the output directory exists
os.makedirs(OUTPUT_DIRECTORY, exist_ok=True)

def custom_json_serializer(obj):
    """Custom JSON serializer for unsupported Firestore data types."""
    if isinstance(obj, DatetimeWithNanoseconds):
        return obj.isoformat()  # Convert to ISO 8601 string
    elif isinstance(obj, datetime.datetime):
        return obj.isoformat()
    elif isinstance(obj, firestore.DocumentReference):
        return obj.path  # Serialize DocumentReference as its path
    logging.warning(f"Unhandled data type during serialization: {type(obj)}")
    return str(obj)

def fetch_and_save_data(collection_name):
    """Fetch data from Firestore and save to a local JSONL file."""
    try:
        logging.info(f"Fetching data from Firestore collection: {collection_name}")
        db = firestore.Client()
        collection_ref = db.collection(collection_name)
        docs = collection_ref.stream()

        data = []
        for doc in docs:
            doc_dict = doc.to_dict()
            doc_dict["id"] = doc.id  # Add document ID
            data.append(doc_dict)

        logging.info(f"Fetched {len(data)} records from collection: {collection_name}")

        # Save to JSONL file
        local_file_path = os.path.join(OUTPUT_DIRECTORY, f"{collection_name}.jsonl")
        with open(local_file_path, "w") as f:
            for record in data:
                f.write(json.dumps(record, default=custom_json_serializer) + "\n")

        logging.info(f"Data saved to JSONL file: {local_file_path}")
        return local_file_path
    except Exception as e:
        logging.error(f"Failed to fetch or save data for collection {collection_name}: {e}")
        raise

def upload_to_gcs(local_file_path, bucket_name, destination_blob_name):
    """Upload a file to Google Cloud Storage."""
    try:
        logging.info(f"Uploading {local_file_path} to GCS bucket {bucket_name} as {destination_blob_name}")
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_filename(local_file_path)
        logging.info(f"File {local_file_path} successfully uploaded to gs://{bucket_name}/{destination_blob_name}")
    except Exception as e:
        logging.error(f"Failed to upload file {local_file_path} to GCS: {e}")
        raise

def main():
    logging.info("Starting Firestore export process")
    for collection in COLLECTIONS:
        try:
            logging.info(f"Processing collection: {collection}")
            local_file = fetch_and_save_data(collection)
            upload_to_gcs(local_file, GCS_BUCKET_NAME, f"{collection}.jsonl")
        except Exception as e:
            logging.error(f"Error processing collection {collection}: {e}")

if __name__ == "__main__":
    main()