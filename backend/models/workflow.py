from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from ..database import Base

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    website_url = Column(String(1024), nullable=False)
    status = Column(String(50), default="not_started")  # not_started, in_progress, blocked, completed, interrupted
    current_step = Column(Integer, default=1)
    total_steps = Column(Integer, default=1)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    steps = relationship("WorkflowStep", back_populates="workflow", cascade="all, delete-orphan", order_by="WorkflowStep.step_index")
    checkpoints = relationship("Checkpoint", back_populates="workflow", cascade="all, delete-orphan", order_by="desc(Checkpoint.created_at)")
