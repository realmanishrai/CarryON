from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
from ..models.checkpoint import Checkpoint
from ..models.workflow import Workflow
from ..schemas.recovery import (
    RestoreRequest, RestorePlanResponse,
    VerifyRecoveryRequest, VerifyRecoveryResponse
)

class RecoveryService:
    @staticmethod
    def prepare_restore_plan(
        db: Session,
        workflow_id: int,
        checkpoint_id: Optional[int] = None,
        approved_field_ids: Optional[List[str]] = None
    ) -> Optional[RestorePlanResponse]:
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            return None

        # Get specified checkpoint or latest
        if checkpoint_id:
            checkpoint = db.query(Checkpoint).filter(
                Checkpoint.id == checkpoint_id,
                Checkpoint.workflow_id == workflow_id
            ).first()
        else:
            checkpoint = db.query(Checkpoint).filter(
                Checkpoint.workflow_id == workflow_id
            ).order_by(Checkpoint.created_at.desc()).first()

        if not checkpoint:
            return None

        snapshot = checkpoint.state_snapshot or {}
        fields_to_restore = {}
        fields_skipped = []

        # Sensitive field keywords that should NEVER be restored automatically
        sensitive_patterns = ["password", "otp", "token", "cvv", "credit_card", "ssn"]

        for fid, val in snapshot.items():
            fid_lower = fid.lower()
            if any(s in fid_lower for s in sensitive_patterns):
                fields_skipped.append(fid)
                continue

            if approved_field_ids is not None and fid not in approved_field_ids:
                fields_skipped.append(fid)
                continue

            fields_to_restore[fid] = val

        summary = (
            f"Prepared restore plan from checkpoint #{checkpoint.id} (Step {checkpoint.step_index}). "
            f"{len(fields_to_restore)} field(s) eligible for restoration, {len(fields_skipped)} skipped."
        )

        return RestorePlanResponse(
            workflow_id=workflow_id,
            checkpoint_id=checkpoint.id,
            step_index=checkpoint.step_index,
            fields_to_restore=fields_to_restore,
            fields_skipped=fields_skipped,
            summary=summary
        )

    @staticmethod
    def verify_recovery(req: VerifyRecoveryRequest) -> VerifyRecoveryResponse:
        is_resolved = True
        msg = f"Field '{req.field_id}' was successfully restored."

        if req.expected_value is not None and req.actual_value is not None:
            if req.actual_value.strip() != req.expected_value.strip():
                is_resolved = False
                msg = f"Field '{req.field_id}' value '{req.actual_value}' does not match expected '{req.expected_value}'."

        if req.form_validity is False:
            is_resolved = False
            msg = f"Field '{req.field_id}' still triggers validation error in form."

        return VerifyRecoveryResponse(
            field_id=req.field_id,
            is_resolved=is_resolved,
            message=msg,
            current_step_valid=is_resolved
        )
