from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict, Literal

class DOMFieldMetadata(BaseModel):
    carryon_id: str
    tag_name: str
    input_type: Optional[str] = "text"
    label: Optional[str] = ""
    name: Optional[str] = None
    id: Optional[str] = None
    placeholder: Optional[str] = None
    required: bool = False
    value_present: bool = False
    current_value: Optional[str] = None
    validity_state: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    section: Optional[str] = None
    disabled: bool = False
    readonly: bool = False

class ActionRecommendation(BaseModel):
    action: Literal[
        "highlight_field",
        "show_message",
        "focus_field",
        "scroll_to_field",
        "fill_field",
        "clear_highlight",
        "suggest_correction",
        "save_checkpoint"
    ]
    field_id: Optional[str] = None
    message: Optional[str] = None
    suggested_value: Optional[str] = None
    severity: Optional[Literal["info", "warning", "error"]] = "info"
    requires_approval: bool = False

class PageAnalysisRequest(BaseModel):
    website_url: str
    page_title: Optional[str] = None
    fields: List[DOMFieldMetadata] = Field(default_factory=list)
    current_step: Optional[int] = 1
    total_steps: Optional[int] = 5
    detected_errors: List[Dict[str, Any]] = Field(default_factory=list)

class PageAnalysisResponse(BaseModel):
    page_status: str  # ready, needs_attention, blocked, completed
    current_step_inferred: int
    summary: str
    issues: List[Dict[str, Any]] = Field(default_factory=list)
    recommended_actions: List[ActionRecommendation] = Field(default_factory=list)
    confidence: float = 0.9

class ExplainFieldRequest(BaseModel):
    field_metadata: DOMFieldMetadata
    user_question: Optional[str] = None
    page_context: Optional[str] = None

class ExplainFieldResponse(BaseModel):
    field_id: str
    field_label: str
    explanation: str
    examples: List[str] = Field(default_factory=list)
    recommended_action: Optional[ActionRecommendation] = None

class MatchProfileRequest(BaseModel):
    fields: List[DOMFieldMetadata]
    profile: Optional[Dict[str, Any]] = None

class FieldMatch(BaseModel):
    field_id: str
    field_label: str
    profile_key: str
    suggested_value: Any
    confidence: float
    match_type: Literal["exact", "semantic", "heuristic"]

class MatchProfileResponse(BaseModel):
    matches: List[FieldMatch] = Field(default_factory=list)
    unmatched_fields: List[str] = Field(default_factory=list)

class ChatHistoryMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

class AIChatRequest(BaseModel):
    message: str
    history: List[ChatHistoryMessage] = Field(default_factory=list)
    page_url: Optional[str] = None
    page_title: Optional[str] = None
    current_step: Optional[int] = 1
    fields: List[DOMFieldMetadata] = Field(default_factory=list)
    detected_errors: List[Dict[str, Any]] = Field(default_factory=list)

class AIChatResponse(BaseModel):
    reply: str
    field_id: Optional[str] = None
    field_label: Optional[str] = None
    action: Optional[ActionRecommendation] = None

