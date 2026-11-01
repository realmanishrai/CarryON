from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.analysis import (
    PageAnalysisRequest, PageAnalysisResponse,
    ExplainFieldRequest, ExplainFieldResponse,
    MatchProfileRequest, MatchProfileResponse,
    AIChatRequest, AIChatResponse
)
from ..services.ai_service import AIService
from ..services.profile_service import ProfileService

router = APIRouter(prefix="/analyze", tags=["AI Analysis"])
ai_service = AIService()

@router.post("", response_model=PageAnalysisResponse)
def analyze_page(req: PageAnalysisRequest):
    return ai_service.understand_page(req)

@router.post("/explain-field", response_model=ExplainFieldResponse)
def explain_field(req: ExplainFieldRequest):
    return ai_service.explain_field(req)

@router.post("/match-profile", response_model=MatchProfileResponse)
def match_profile(req: MatchProfileRequest, db: Session = Depends(get_db)):
    # If profile is not passed in request, look up saved profile from DB
    profile_dict = req.profile
    if not profile_dict:
        saved_profile = ProfileService.get_profile(db)
        if saved_profile:
            profile_dict = {
                "full_name": saved_profile.full_name,
                "email": saved_profile.email,
                "phone": saved_profile.phone,
                "college": saved_profile.college,
                "degree": saved_profile.degree,
                "graduation_year": saved_profile.graduation_year,
                "skills": saved_profile.skills or []
            }
    req.profile = profile_dict
    return ai_service.match_profile_fields(req)

@router.post("/chat", response_model=AIChatResponse)
def chat_with_assistant(req: AIChatRequest):
    return ai_service.chat(req)

