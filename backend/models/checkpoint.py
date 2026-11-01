from sqlalchemy import Column, Integer, JSON, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from ..database import Base

class Checkpoint(Base):
    __tablename__ = "checkpoints"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False)
    step_index = Column(Integer, nullable=False, default=1)
    state_snapshot = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=func.now())

    workflow = relationship("Workflow", back_populates="checkpoints")
