from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..schemas.profile import UserProfileCreate, UserProfileUpdate, UserProfileResponse
from ..services.profile_service import ProfileService

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=Optional[UserProfileResponse])
def get_profile(db: Session = Depends(get_db)):
    profile = ProfileService.get_profile(db)
    return profile

@router.post("", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_profile(profile_in: UserProfileCreate, db: Session = Depends(get_db)):
    return ProfileService.create_or_update_profile(db, profile_in)

@router.put("", response_model=UserProfileResponse)
def update_profile(profile_in: UserProfileUpdate, db: Session = Depends(get_db)):
    updated = ProfileService.update_profile(db, profile_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Profile not found. Create one first.")
    return updated

@router.delete("", status_code=status.HTTP_200_OK)
def delete_profile(db: Session = Depends(get_db)):
    deleted = ProfileService.delete_profile(db)
    if not deleted:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return {"message": "Profile deleted successfully"}
