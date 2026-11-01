from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..schemas.workflow import (
    WorkflowCreate, WorkflowUpdate, WorkflowResponse,
    CheckpointCreate, CheckpointResponse
)
from ..schemas.recovery import RestoreRequest, RestorePlanResponse
from ..services.workflow_service import WorkflowService
from ..services.recovery_service import RecoveryService

router = APIRouter(prefix="/workflow", tags=["Workflows"])

@router.post("/create", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
def create_workflow(wf_in: WorkflowCreate, db: Session = Depends(get_db)):
    return WorkflowService.create_workflow(db, wf_in)

@router.get("", response_model=List[WorkflowResponse])
def list_workflows(limit: int = 50, db: Session = Depends(get_db)):
    return WorkflowService.list_workflows(db, limit)

@router.get("/{workflow_id}", response_model=WorkflowResponse)
def get_workflow(workflow_id: int, db: Session = Depends(get_db)):
    wf = WorkflowService.get_workflow(db, workflow_id)
    if not wf:
        raise HTTPException(status_code=404, detail=f"Workflow with ID {workflow_id} not found.")
    return wf

@router.put("/{workflow_id}", response_model=WorkflowResponse)
def update_workflow(workflow_id: int, wf_in: WorkflowUpdate, db: Session = Depends(get_db)):
    updated = WorkflowService.update_workflow(db, workflow_id, wf_in)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Workflow with ID {workflow_id} not found.")
    return updated

@router.delete("/{workflow_id}", status_code=status.HTTP_200_OK)
def delete_workflow(workflow_id: int, db: Session = Depends(get_db)):
    deleted = WorkflowService.delete_workflow(db, workflow_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Workflow with ID {workflow_id} not found.")
    return {"message": f"Workflow {workflow_id} deleted successfully."}

@router.post("/{workflow_id}/checkpoint", response_model=CheckpointResponse, status_code=status.HTTP_201_CREATED)
def save_checkpoint(workflow_id: int, cp_in: CheckpointCreate, db: Session = Depends(get_db)):
    cp = WorkflowService.create_checkpoint(db, workflow_id, cp_in.step_index, cp_in.state_snapshot)
    if not cp:
        raise HTTPException(status_code=404, detail=f"Workflow with ID {workflow_id} not found.")
    return cp

@router.get("/{workflow_id}/checkpoints", response_model=List[CheckpointResponse])
def list_checkpoints(workflow_id: int, db: Session = Depends(get_db)):
    wf = WorkflowService.get_workflow(db, workflow_id)
    if not wf:
        raise HTTPException(status_code=404, detail=f"Workflow with ID {workflow_id} not found.")
    return WorkflowService.list_checkpoints(db, workflow_id)

@router.post("/{workflow_id}/restore", response_model=RestorePlanResponse)
def restore_workflow(workflow_id: int, req: Optional[RestoreRequest] = None, db: Session = Depends(get_db)):
    checkpoint_id = req.checkpoint_id if req else None
    approved_field_ids = req.approved_field_ids if req else None
    plan = RecoveryService.prepare_restore_plan(db, workflow_id, checkpoint_id, approved_field_ids)
    if not plan:
        raise HTTPException(status_code=404, detail="No valid checkpoint found for workflow restoration.")
    return plan
