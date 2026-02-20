from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app import models, schemas
from app.utils.file_utils import save_upload_file, delete_local_file

router = APIRouter()


@router.post("/me/avatar", response_model=schemas.User)
async def upload_avatar(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Respectively delete old avatar to prevent disk leaks
    if current_user.picture:
        delete_local_file(current_user.picture)

    new_url = await save_upload_file(file, "avatars")
    if not new_url:
        raise HTTPException(status_code=500, detail="Failed to save image")

    current_user.picture = new_url
    await db.commit()
    await db.refresh(current_user)

    return current_user


@router.put("/me", response_model=schemas.User)
async def update_user_me(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
):
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.email is not None:
        current_user.email = user_in.email
    # Note: password updates should ideally be handled carefully (hashed), but per user requests this is for basic data persistence
    if user_in.password is not None:
        from app.core.security import get_password_hash

        current_user.hashed_password = get_password_hash(user_in.password)

    await db.commit()
    await db.refresh(current_user)
    return current_user
