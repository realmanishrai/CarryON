from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime

class WorkflowStepBase(BaseModel):
    step_index: int
    title: str
    description: Optional[str] = None
    status: str = "pending"  # pending, in_progress, completed, blocked
    error_message: Optional[str] = None
    recovery_action: Optional[str] = None

class WorkflowStepCreate(WorkflowStepBase):
    pass

class WorkflowStepUpdate(BaseModel):
    step_index: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    error_message: Optional[str] = None
    recovery_action: Optional[str] = None

class WorkflowStepResponse(WorkflowStepBase):
    id: int
    workflow_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class WorkflowBase(BaseModel):
    title: str
    website_url: str
    status: str = "not_started"
    current_step: int = 1
    total_steps: int = 1

class WorkflowCreate(WorkflowBase):
    steps: List[WorkflowStepCreate] = Field(default_factory=list)

class WorkflowUpdate(BaseModel):
    title: Optional[str] = None
    website_url: Optional[str] = None
    status: Optional[str] = None
    current_step: Optional[int] = None
    total_steps: Optional[int] = None

class CheckpointBase(BaseModel):
    step_index: int = 1
    state_snapshot: Dict[str, Any] = Field(default_factory=dict)

class CheckpointCreate(CheckpointBase):
    workflow_id: int

class CheckpointResponse(CheckpointBase):
    id: int
    workflow_id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class WorkflowResponse(WorkflowBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    steps: List[WorkflowStepResponse] = Field(default_factory=list)
    checkpoints: List[CheckpointResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
