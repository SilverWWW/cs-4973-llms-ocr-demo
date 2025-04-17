import os
from datasets import load_dataset
import supabase
import requests
from PIL import Image
import io
import uuid
import time

# Load the dataset
print("Loading dataset...")
ds = load_dataset("MiXaiLL76/TextOCR_OCR", split="test")
print(f"Dataset loaded with {len(ds)} items")

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables")

client = supabase.create_client(supabase_url, supabase_key)

# Create a bucket if it doesn't exist
bucket_name = "ocr-images"
try:
    client.storage.get_bucket(bucket_name)
    print(f"Bucket '{bucket_name}' already exists")
except:
    client.storage.create_bucket(bucket_name)
    print(f"Created bucket '{bucket_name}'")

# Upload a subset of images to Supabase
num_images_to_upload = min(500, len(ds))  # Upload up to 500 images
print(f"Uploading {num_images_to_upload} images to Supabase...")

for i in range(num_images_to_upload):
    try:
        item = ds[i]
        image = item["image"]
        text = item["text"]
        
        # Convert PIL image to bytes
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        # Generate a unique filename
        image_id = str(uuid.uuid4())
        filename = f"{image_id}.png"
        
        # Upload image to Supabase Storage
        client.storage.from_(bucket_name).upload(
            path=filename,
            file=img_byte_arr,
            file_options={"content-type": "image/png"}
        )
        
        # Get the public URL
        image_path = client.storage.from_(bucket_name).get_public_url(filename)
        
        # Insert metadata into the database
        client.table("ocr_images").insert({
            "id": image_id,
            "image_path": image_path,
            "correct_text": text,
            "correct_count": 0,
            "incorrect_count": 0
        }).execute()
        
        print(f"Uploaded image {i+1}/{num_images_to_upload}: {filename}")

        # Print progress every 10 images
        if (i + 1) % 10 == 0:
            print(f"Progress: {i+1}/{num_images_to_upload} images uploaded ({(i+1)/num_images_to_upload*100:.1f}%)")
        
        # Add a small delay to avoid rate limiting
        time.sleep(0.5)
        
    except Exception as e:
        print(f"Error uploading image {i+1}: {str(e)}")

print("Upload complete!")
