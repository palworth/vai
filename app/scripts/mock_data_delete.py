import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase with credentials from environment variable
cred = credentials.Certificate(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
firebase_admin.initialize_app(cred)
db = firestore.client()

# File path to the JSON file
file_path = 'app/scripts/outputs/created_items.json'

def delete_created_items(file_path):
    try:
        # Read the JSON file
        with open(file_path, 'r') as file:
            created_items = json.load(file)
        
        # Loop through the items and delete them from Firestore
        for item in created_items:
            collection = item.get("collection")
            doc_id = item.get("id")
            
            if collection and doc_id:
                doc_ref = db.collection(collection).document(doc_id)
                doc_ref.delete()
                print(f"Deleted {doc_id} from {collection}")
            else:
                print(f"Invalid item: {item}")
    except Exception as e:
        print(f"An error occurred: {e}")

# Run the deletion process
delete_created_items(file_path)
