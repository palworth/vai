import os
from google.cloud import storage
from firebase_admin import credentials, initialize_app

# Firebase/GCS initialization
cred = credentials.Certificate(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
initialize_app(cred)
storage_client = storage.Client()

# Bucket and folder configuration
BUCKET_NAME = "firestore-batch-boi"
FOLDER_NAME = "mockData"
LOCAL_FOLDER = "app/scripts/outputs"

# File names to upload
FILES_TO_UPLOAD = ["users.csv", "dogs.csv", "exerciseEvents.csv", "healthEvents.csv", "dietEvents.csv", "behaviorEvents.csv" ]

def upload_to_gcs():
    try:
        bucket = storage_client.bucket(BUCKET_NAME)

        for file_name in FILES_TO_UPLOAD:
            local_file_path = os.path.join(LOCAL_FOLDER, file_name)

            if not os.path.exists(local_file_path):
                print(f"File not found: {local_file_path}. Skipping...")
                continue

            # Construct GCS file path
            blob_path = f"{FOLDER_NAME}/{file_name}"

            # Upload file
            blob = bucket.blob(blob_path)
            blob.upload_from_filename(local_file_path)

            print(f"Uploaded {file_name} to gs://{BUCKET_NAME}/{blob_path}")

    except Exception as e:
        print(f"Error uploading files to GCS: {e}")

if __name__ == "__main__":
    upload_to_gcs()
