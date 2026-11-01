from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from .analysis import ActionRecommendation, DOMFieldMetadata

class RecoveryPlanRequest(BaseModel):
    website_url: str
    current_step: Optional[int] = 1
    fields: List[DOMFieldMetadata] = Field(default_factory=list)
    errors: List[Dict[str, Any]] = Field(default_factory=list)
    workflow_id: Optional[int] = None
    last_checkpoint_id: Optional[int] = None

class RecoveryPlanResponse(BaseModel):
    status: str  # diagnosed, no_issues_found, unresolvable
    summary: str
    blockers: List[Dict[str, Any]] = Field(default_factory=list)
    actions: List[ActionRecommendation] = Field(default_factory=list)
    can_auto_recover: bool = True

class RestoreRequest(BaseModel):
    checkpoint_id: Optional[int] = None
    approved_field_ids: Optional[List[str]] = None

class RestorePlanResponse(BaseModel):
    workflow_id: int
    checkpoint_id: int
    step_index: int
    fields_to_restore: Dict[str, Any] = Field(default_factory=dict)
    fields_skipped: List[str] = Field(default_factory=list)
    summary: str

class VerifyRecoveryRequest(BaseModel):
    workflow_id: Optional[int] = None
    field_id: str
    expected_value: Optional[str] = None
    actual_value: Optional[str] = None
    form_validity: Optional[bool] = None

class VerifyRecoveryResponse(BaseModel):
    field_id: str
    is_resolved: bool
    message: str
    current_step_valid: bool
