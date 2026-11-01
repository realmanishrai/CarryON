from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from ..models.workflow import Workflow
from ..models.workflow_step import WorkflowStep
from ..models.checkpoint import Checkpoint
from ..schemas.workflow import WorkflowCreate, WorkflowUpdate, WorkflowStepCreate

class WorkflowService:
    @staticmethod
    def create_workflow(db: Session, wf_in: WorkflowCreate) -> Workflow:
        workflow = Workflow(
            title=wf_in.title,
            website_url=wf_in.website_url,
            status=wf_in.status,
            current_step=wf_in.current_step,
            total_steps=wf_in.total_steps
        )
        db.add(workflow)
        db.flush()

        for step_data in wf_in.steps:
            step = WorkflowStep(
                workflow_id=workflow.id,
                step_index=step_data.step_index,
                title=step_data.title,
                description=step_data.description,
                status=step_data.status,
                error_message=step_data.error_message,
                recovery_action=step_data.recovery_action
            )
            db.add(step)
            
        db.commit()
        db.refresh(workflow)
        return workflow

    @staticmethod
    def get_workflow(db: Session, workflow_id: int) -> Optional[Workflow]:
        return db.query(Workflow).filter(Workflow.id == workflow_id).first()

    @staticmethod
    def list_workflows(db: Session, limit: int = 50) -> List[Workflow]:
        return db.query(Workflow).order_by(Workflow.updated_at.desc()).limit(limit).all()

    @staticmethod
    def update_workflow(db: Session, workflow_id: int, wf_in: WorkflowUpdate) -> Optional[Workflow]:
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            return None
        
        update_data = wf_in.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            setattr(workflow, key, val)
            
        db.commit()
        db.refresh(workflow)
        return workflow

    @staticmethod
    def delete_workflow(db: Session, workflow_id: int) -> bool:
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            return False
        db.delete(workflow)
        db.commit()
        return True

    @staticmethod
    def create_checkpoint(db: Session, workflow_id: int, step_index: int, state_snapshot: Dict[str, Any]) -> Optional[Checkpoint]:
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            return None

        checkpoint = Checkpoint(
            workflow_id=workflow_id,
            step_index=step_index,
            state_snapshot=state_snapshot
        )
        db.add(checkpoint)
        
        # Also update workflow's current_step and status if appropriate
        workflow.current_step = step_index
        if workflow.status == "not_started":
            workflow.status = "in_progress"
            
        db.commit()
        db.refresh(checkpoint)
        return checkpoint

    @staticmethod
    def list_checkpoints(db: Session, workflow_id: int) -> List[Checkpoint]:
        return db.query(Checkpoint).filter(Checkpoint.workflow_id == workflow_id).order_by(Checkpoint.created_at.desc()).all()

    @staticmethod
    def get_latest_checkpoint(db: Session, workflow_id: int) -> Optional[Checkpoint]:
        return db.query(Checkpoint).filter(Checkpoint.workflow_id == workflow_id).order_by(Checkpoint.created_at.desc()).first()
