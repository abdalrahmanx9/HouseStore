import os
import uuid
import aiofiles
from typing import Optional
from fastapi import UploadFile


def get_storage_path() -> str:
    """Returns the base storage directory and ensures it exists."""
    storage_dir = "uploaded_files"
    if not os.path.exists(storage_dir):
        os.makedirs(storage_dir)
    return storage_dir


async def save_upload_file(file: UploadFile, subfolder: str) -> Optional[str]:
    """
    Saves an uploaded file to disk natively, organizing them by subfolder.
    Generates a unique UUID filename to naturally avoid collisions.
    Returns the URL/path logic ready to be stored in the DB.
    """
    if not file:
        return None

    base_dir = get_storage_path()
    folder_path = os.path.join(base_dir, subfolder)

    if not os.path.exists(folder_path):
        os.makedirs(folder_path, exist_ok=True)

    file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(folder_path, unique_filename)

    async with aiofiles.open(file_path, "wb") as out_file:
        content = await file.read()
        await out_file.write(content)

    return f"/files/{subfolder}/{unique_filename}"


def delete_local_file(file_url: str) -> bool:
    """
    Safely deletes a local file from disk.
    file_url is expected to look like '/files/avatars/UUID.png'
    """
    if not file_url or not file_url.startswith("/files/"):
        return False

    try:
        # Construct exact disk path from the url string
        # e.g. /files/avatars/abc.png -> uploaded_files/avatars/abc.png
        relative_path = file_url.replace("/files/", "uploaded_files/", 1)
        if os.path.exists(relative_path):
            os.remove(relative_path)
            return True
        return False
    except Exception:
        # We explicitly catch and silently drop missing file exceptions
        # to ensure the broader operation (like updating an avatar) doesn't fail.
        return False
