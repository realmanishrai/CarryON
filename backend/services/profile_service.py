from sqlalchemy.orm import Session
from typing import Optional
from ..models.profile import UserProfile
from ..schemas.profile import UserProfileCreate, UserProfileUpdate

class ProfileService:
    @staticmethod
    def get_profile(db: Session) -> Optional[UserProfile]:
        return db.query(UserProfile).first()

    @staticmethod
    def create_or_update_profile(db: Session, profile_in: UserProfileCreate) -> UserProfile:
        profile = db.query(UserProfile).first()
        if not profile:
            profile = UserProfile(
                full_name=profile_in.full_name,
                email=profile_in.email,
                phone=profile_in.phone,
                college=profile_in.college,
                degree=profile_in.degree,
                graduation_year=profile_in.graduation_year,
                skills=profile_in.skills or []
            )
            db.add(profile)
        else:
            if profile_in.full_name is not None:
                profile.full_name = profile_in.full_name
            if profile_in.email is not None:
                profile.email = profile_in.email
            if profile_in.phone is not None:
                profile.phone = profile_in.phone
            if profile_in.college is not None:
                profile.college = profile_in.college
            if profile_in.degree is not None:
                profile.degree = profile_in.degree
            if profile_in.graduation_year is not None:
                profile.graduation_year = profile_in.graduation_year
            if profile_in.skills is not None:
                profile.skills = profile_in.skills
        
        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def update_profile(db: Session, profile_in: UserProfileUpdate) -> Optional[UserProfile]:
        profile = db.query(UserProfile).first()
        if not profile:
            return None
        
        update_data = profile_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(profile, key, value)
            
        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def delete_profile(db: Session) -> bool:
        profile = db.query(UserProfile).first()
        if profile:
            db.delete(profile)
            db.commit()
            return True
        return False
