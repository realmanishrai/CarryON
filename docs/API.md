# CarryON AI — Backend REST API Specification

The CarryON AI backend is built with FastAPI. By default, it runs at `http://127.0.0.1:8000`.
Interactive Swagger API documentation is available at `http://127.0.0.1:8000/docs`.

---

## 1. System & Health

### `GET /health`
Returns backend service availability, database status, and AI engine status.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "CarryON AI Backend",
  "version": "1.0.0",
  "database": "healthy",
  "ai_engine": "ready",
  "configured_model": "gpt-4o-mini"
}
```

### `GET /`
Root endpoint providing service metadata.

**Response `200 OK`**:
```json
{
  "product": "CarryON AI",
  "tagline": "The AI Recovery Layer for the Internet",
  "docs_url": "/docs",
  "health_url": "/health"
}
```

---

## 2. User Profile Management

### `GET /profile`
Retrieves the saved user profile, or `null` if no profile exists yet.

**Response `200 OK`**:
```json
{
  "id": 1,
  "full_name": "Alex Mercer",
  "email": "alex.mercer@example.com",
  "phone": "+1-555-0199",
  "college": "Stanford University",
  "degree": "B.S. Computer Science",
  "graduation_year": 2026,
  "skills": ["Python", "React", "TypeScript", "FastAPI"],
  "created_at": "2026-11-01T10:45:00.000Z",
  "updated_at": "2026-11-01T10:45:00.000Z"
}
```

### `POST /profile`
Creates or replaces the saved user profile.

**Request Body**:
```json
{
  "full_name": "Alex Mercer",
  "email": "alex.mercer@example.com",
  "phone": "+1-555-0199",
  "college": "Stanford University",
  "degree": "B.S. Computer Science",
  "graduation_year": 2026,
  "skills": ["Python", "React", "TypeScript", "FastAPI"]
}
```

**Response `201 Created`**: Returns created profile object.

### `PUT /profile`
Partially updates the saved user profile.

**Response `200 OK`**: Returns updated profile object.

### `DELETE /profile`
Deletes the saved user profile.

**Response `200 OK`**:
```json
{
  "message": "Profile deleted successfully"
}
```

---

## 3. Workflows

### `POST /workflow/create`
Creates a new workflow tracking an online process.

**Request Body**:
```json
{
  "title": "Senior Software Engineer Application",
  "website_url": "http://localhost:8080/application.html",
  "status": "in_progress",
  "current_step": 1,
  "total_steps": 5,
  "steps": [
    { "step_index": 1, "title": "Personal Information", "status": "in_progress" },
    { "step_index": 2, "title": "Education", "status": "pending" },
    { "step_index": 3, "title": "Experience", "status": "pending" },
    { "step_index": 4, "title": "Skills and Resume", "status": "pending" },
    { "step_index": 5, "title": "Review and Submit", "status": "pending" }
  ]
}
```

**Response `201 Created`**: Returns the complete workflow object with generated IDs.

### `GET /workflow`
Retrieves a list of recent workflows.
- Query Parameter: `limit` (default: 50).

**Response `200 OK`**: Array of `WorkflowResponse` objects.

### `GET /workflow/{workflow_id}`
Retrieves a specific workflow with its steps and checkpoints.

**Response `200 OK`**: Single `WorkflowResponse` object.
**Error `404 Not Found`**: If workflow does not exist.

### `PUT /workflow/{workflow_id}`
Updates workflow metadata (e.g. `current_step`, `status`).

**Response `200 OK`**: Updated workflow object.

### `DELETE /workflow/{workflow_id}`
Deletes a workflow and all associated steps and checkpoints (cascaded).

**Response `200 OK`**:
```json
{
  "message": "Workflow 1 deleted successfully."
}
```

---

## 4. Checkpoints & Recovery Replay

### `POST /workflow/{workflow_id}/checkpoint`
Persists a snapshot of form field values for Recovery Replay.

**Request Body**:
```json
{
  "workflow_id": 1,
  "step_index": 2,
  "state_snapshot": {
    "full_name": "Alex Mercer",
    "email": "alex.mercer@example.com",
    "phone": "+1-555-0199",
    "college": "Stanford University",
    "degree": "B.S. Computer Science",
    "graduation_year": "2026"
  }
}
```

**Response `201 Created`**: Returns saved `CheckpointResponse`.

### `GET /workflow/{workflow_id}/checkpoints`
Lists all saved checkpoints for the given workflow ordered newest first.

**Response `200 OK`**: Array of `CheckpointResponse` objects.

### `POST /workflow/{workflow_id}/restore`
Generates a Recovery Replay restoration plan based on a saved checkpoint.

**Request Body** (optional):
```json
{
  "checkpoint_id": 1,
  "approved_field_ids": ["full_name", "email", "phone"]
}
```

**Response `200 OK`**:
```json
{
  "workflow_id": 1,
  "checkpoint_id": 1,
  "step_index": 2,
  "fields_to_restore": {
    "full_name": "Alex Mercer",
    "email": "alex.mercer@example.com",
    "phone": "+1-555-0199"
  },
  "fields_skipped": [],
  "summary": "Prepared restore plan from checkpoint #1 (Step 2). 3 field(s) eligible for restoration, 0 skipped."
}
```

---

## 5. AI Analysis Engine

### `POST /analyze`
Analyzes webpage form fields and detected blockers using structured AI / deterministic logic.

**Request Body**:
```json
{
  "website_url": "http://localhost:8080/application.html",
  "page_title": "Apex Careers Application",
  "current_step": 1,
  "total_steps": 5,
  "fields": [
    {
      "carryon_id": "phone",
      "tag_name": "input",
      "input_type": "tel",
      "label": "Phone Number",
      "required": true,
      "value_present": true,
      "current_value": "abc123phone"
    }
  ],
  "detected_errors": []
}
```

### `POST /analyze/chat`
Conversational endpoint for the Assistant Chat screen. Grounded in the current webpage context, fields, and active errors.

**Request Body**:
```json
{
  "message": "can you explain phone number field",
  "history": [],
  "page_url": "http://localhost:8080/application.html",
  "page_title": "Apex Job Application",
  "current_step": 1,
  "fields": [ ... ],
  "detected_errors": [ ... ]
}
```

**Response `200 OK`**:
```json
{
  "reply": "The Phone Number field expects you to enter your contact number using digits only. It should not contain any alphabetic characters or special symbols. A common format is (123) 456-7890 or simply 1234567890. Currently, your input has invalid letters. Please enter digits only.",
  "field_id": "phone",
  "field_label": "Phone Number",
  "action": {
    "action": "highlight_field",
    "field_id": "phone",
    "message": "Please enter digits only for the phone number.",
    "severity": "error",
    "requires_approval": false
  }
}
```


**Response `200 OK`**:
```json
{
  "page_status": "blocked",
  "current_step_inferred": 1,
  "summary": "Detected 1 field issue(s) requiring attention.",
  "issues": [
    {
      "field_id": "phone",
      "field_label": "Phone Number",
      "error_type": "invalid_phone_alphabetic",
      "message": "Invalid phone number. Phone numbers must not contain alphabetic characters. Enter digits only.",
      "severity": "error",
      "action": "highlight_field"
    }
  ],
  "recommended_actions": [
    {
      "action": "highlight_field",
      "field_id": "phone",
      "message": "Invalid phone number. Phone numbers must not contain alphabetic characters. Enter digits only.",
      "severity": "error",
      "requires_approval": false
    }
  ],
  "confidence": 0.85
}
```

### `POST /analyze/explain-field`
Generates contextual guidance for an ambiguous or confusing form field.

**Request Body**:
```json
{
  "field_metadata": {
    "carryon_id": "notice_period",
    "tag_name": "select",
    "label": "Notice Period (Days)"
  },
  "user_question": "What does notice period mean?"
}
```

**Response `200 OK`**:
```json
{
  "field_id": "notice_period",
  "field_label": "Notice Period (Days)",
  "explanation": "Notice period refers to the duration of time you must continue working at your current employer after giving formal notice of resignation.",
  "examples": ["Immediate / 0 days", "15 days", "30 days", "60 days"],
  "recommended_action": null
}
```

### `POST /analyze/match-profile`
Compares webpage fields against the saved user profile for smart autofill.

**Request Body**:
```json
{
  "fields": [
    { "carryon_id": "full_name", "tag_name": "input", "label": "Full Name" },
    { "carryon_id": "college", "tag_name": "input", "label": "Institution enrolled in" }
  ]
}
```

**Response `200 OK`**:
```json
{
  "matches": [
    {
      "field_id": "full_name",
      "field_label": "Full Name",
      "profile_key": "full_name",
      "suggested_value": "Alex Mercer",
      "confidence": 0.95,
      "match_type": "exact"
    },
    {
      "field_id": "college",
      "field_label": "Institution enrolled in",
      "profile_key": "college",
      "suggested_value": "Stanford University",
      "confidence": 0.85,
      "match_type": "heuristic"
    }
  ],
  "unmatched_fields": []
}
```

---

## 6. Recovery Engine

### `POST /recover`
Diagnoses application blockers and produces structured recovery recommendations.

### `POST /recover/verify`
Verifies whether a recovery action successfully updated the DOM input and resolved the blocker.

**Request Body**:
```json
{
  "workflow_id": 1,
  "field_id": "experience_years",
  "expected_value": "3",
  "actual_value": "3",
  "form_validity": true
}
```

**Response `200 OK`**:
```json
{
  "field_id": "experience_years",
  "is_resolved": true,
  "message": "Field 'experience_years' was successfully restored.",
  "current_step_valid": true
}
```
