from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.recovery import (
    RecoveryPlanRequest, RecoveryPlanResponse,
    VerifyRecoveryRequest, VerifyRecoveryResponse
)
from ..services.ai_service import AIService
from ..services.recovery_service import RecoveryService

router = APIRouter(prefix="/recover", tags=["Recovery Engine"])
ai_service = AIService()

@router.post("", response_model=RecoveryPlanResponse)
def diagnose_and_plan_recovery(req: RecoveryPlanRequest):
    return ai_service.generate_recovery_plan(req)

@router.post("/verify", response_model=VerifyRecoveryResponse)
def verify_recovery(req: VerifyRecoveryRequest):
    return RecoveryService.verify_recovery(req)
