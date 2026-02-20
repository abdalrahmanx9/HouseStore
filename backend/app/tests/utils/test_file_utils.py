import os
import pytest
from unittest.mock import AsyncMock
from fastapi import UploadFile
from app.utils.file_utils import save_upload_file, delete_local_file


@pytest.mark.asyncio
async def test_save_upload_file_creates_unique_name(tmp_path, monkeypatch):
    # Mock get_storage_path to use temporary directory
    monkeypatch.setattr("app.utils.file_utils.get_storage_path", lambda: str(tmp_path))

    # Mock UploadFile
    mock_file = AsyncMock(spec=UploadFile)
    mock_file.filename = "test_image.png"
    mock_file.read.return_value = b"fake image content"

    # Act
    subfolder = "products"
    result_url = await save_upload_file(mock_file, subfolder)

    # Assert
    assert result_url is not None
    assert result_url.startswith(f"/files/{subfolder}/")
    assert result_url.endswith(".png")

    # Translate URL back to disk path to check if it actually saved
    # But since we mocked get_storage_path, it actually saved in tmp_path
    # The utils logic joins base_dir (tmp_path) + subfolder directly onto disk
    actual_filename = result_url.split("/")[-1]
    disk_path = os.path.join(str(tmp_path), subfolder, actual_filename)

    assert os.path.exists(disk_path)
    with open(disk_path, "rb") as f:
        assert f.read() == b"fake image content"


def test_delete_local_file_safe_missing_file():
    # Attempting to delete a file that doesn't exist should fail gracefully and return False
    # Not raise an unhandled exception
    fake_url = "/files/avatars/does_not_exist.png"
    result = delete_local_file(fake_url)
    assert result is False


def test_delete_local_file_success(tmp_path, monkeypatch):
    # Setup actual file
    mock_storage = tmp_path / "uploaded_files"
    mock_subdir = mock_storage / "avatars"
    mock_subdir.mkdir(parents=True, exist_ok=True)

    test_file = mock_subdir / "test_avatar.png"
    test_file.write_bytes(b"data")

    # In file_utils, delete_local_file replaces "/files/" with "uploaded_files/"
    # For this to work in test without mocking the exact replace, we must ensure
    # our current working directory for the test contains "uploaded_files"
    # Or we monkeypatch os.path.exists and os.remove

    def mock_exists(path):
        return path == "uploaded_files/avatars/test_avatar.png"

    def mock_remove(path):
        assert path == "uploaded_files/avatars/test_avatar.png"

    monkeypatch.setattr("os.path.exists", mock_exists)
    monkeypatch.setattr("os.remove", mock_remove)

    # Act
    url = "/files/avatars/test_avatar.png"
    result = delete_local_file(url)
    assert result is True
