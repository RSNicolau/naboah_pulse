import os
from supabase import create_client, Client
from config import settings

# Initialize Supabase Client
url: str = settings.SUPABASE_URL
key: str = settings.SUPABASE_KEY

supabase: Client = None

if url and key:
    supabase = create_client(url, key)

def get_supabase_client() -> Client:
    if not supabase:
        raise ValueError("Supabase credentials not configured in .env")
    return supabase

def upload_media_asset(file_path: str, bucket: str = "media-pulse"):
    client = get_supabase_client()
    file_name = os.path.basename(file_path)
    with open(file_path, "rb") as f:
        res = client.storage.from_(bucket).upload(file_name, f)
    return res
