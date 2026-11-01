# CarryON AI — Automated & Manual Testing Guide

This document details the automated test suite, coverage areas, execution commands, and manual verification journeys for **CarryON AI**.

---

## 1. Automated Test Suite Summary

The testing suite covers backend API services, database transactions, AI schema validation, deterministic error detection, DOM extraction, Shadow DOM injection, autofill event propagation, and React side panel components.

| Test Domain | Runner | Test Files | Total Tests | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Backend Services & API** | Pytest | 6 files in `backend/tests/` | **14 tests** | **100% Passed** |
| **Frontend & DOM Engine** | Vitest | 5 files in `extension/src/test/` | **18 tests** | **100% Passed** |
| **Total Automated Tests** | — | **11 files** | **32 tests** | **All Passed** |

---

## 2. Test Execution Commands

### A. Run All Backend Tests (Python / Pytest)
```powershell
# From repository root (Windows PowerShell)
.\.venv\Scripts\pytest backend\tests -v
```
*(macOS / Linux: `source .venv/bin/activate && pytest backend/tests -v`)*

**Expected Result**:
```text
============================= 14 passed in 4.89s ==============================
```

### B. Run All Frontend & DOM Tests (Vitest)
```powershell
# From repository root
cd extension
npm test
```

**Expected Result**:
```text
 Test Files  5 passed (5)
      Tests  18 passed (18)
```

---

## 3. Test Coverage Breakdown

### Backend Tests (`backend/tests/`)
1. **`test_health.py`**:
   - `test_health_check`: Verifies `GET /health` reports database health and AI readiness.
   - `test_root_endpoint`: Verifies `GET /` metadata.
2. **`test_profile.py`**:
   - `test_profile_lifecycle`: Verifies complete Profile CRUD (create, read, update, delete).
3. **`test_workflow.py`**:
   - `test_workflow_lifecycle_and_checkpoints`: Verifies workflow creation, step cascade relationships, checkpoint persistence, and restore plan generation.
4. **`test_analyze.py`**:
   - `test_analyze_page_with_phone_error`: Verifies phone number alphabetic error detection.
   - `test_explain_field`: Verifies contextual field guidance generation.
   - `test_match_profile`: Verifies mapping of profile keys to webpage fields.
5. **`test_recovery.py`**:
   - `test_recover_diagnose_and_verify`: Verifies diagnosis, action recommendation, and post-recovery value matching.
6. **`test_ai_service.py`**:
   - Verifies handling of missing API keys, graceful fallbacks, and deterministic constraints.
7. **`test_e2e_journey.py`**:
   - Verifies complete end-to-end integration across all 5 user journeys in an isolated session.

### Frontend & DOM Tests (`extension/src/test/`)
1. **`dom-extractor.test.ts`**:
   - Form fields extraction (`input`, `select`, `textarea`).
   - Stable `data-carryon-id` assignment.
   - Exclusion of sensitive password and hidden fields.
2. **`error-detector.test.ts`**:
   - Scenario A: Phone with alphabetic letters flagged.
   - Valid phone numbers passing cleanly.
   - Scenario C: Negative years of experience flagged.
   - Scenario B: Required empty fields detected.
3. **`overlay-manager.test.ts`**:
   - Inline highlight injection with Shadow DOM isolation.
   - Error highlight removal and style restoration.
   - Global highlight cleanup.
4. **`autofill-engine.test.ts`**:
   - Native property value setting with synthetic `input` and `change` event dispatch.
   - Strict rejection of passwords, tokens, and OTPs.
   - Safe rejection of disabled or non-existent fields.
5. **`components.test.tsx`**:
   - `Header` connection and AI status rendering.
   - `Sidebar` tab navigation and error badge display.
   - `ProgressTracker` roadmap step rendering.
   - `ErrorCard` locate action trigger.

---

## 4. Manual Verification Steps on the Controlled Demo Website

Ensure both the backend and demo website are running:
- Backend: `.\.venv\Scripts\uvicorn backend.main:app --port 8000`
- Demo Website: `.\.venv\Scripts\python demo-website\server.py 8080`
- Chrome Extension: Loaded from `extension/dist` in `chrome://extensions`

### Journey 1: Page Understanding & Workflow Association
1. Open Chrome and navigate to `http://localhost:8080/application.html`.
2. Click the CarryON extension icon to open the side panel.
3. Observe that CarryON connects to the backend, identifies the form, and populates the **Overview** dashboard with the workflow title and 5 roadmap steps.

### Journey 2: Error Detection & DOM Intervention (Scenario A)
1. On Step 1 (Personal Info), enter `phone123` into the Phone Number field.
2. Click the side panel **Recovery** tab or click the Refresh/Scan button.
3. Click **Locate in Page** on the detected issue.
4. Observe that the Phone field on the webpage is highlighted with a red glowing border and an inline CarryON diagnostic card appears.
5. Delete `phone123` and enter `+1 (555) 019-2834`.
6. Observe that the error styling disappears.

### Journey 3: Smart Autofill (Scenario D)
1. In the CarryON side panel, open the **Profile** tab.
2. Enter your credentials (e.g. Full Name, Email, College, Degree, Skills) and click **Save Profile Memory**.
3. Reload `http://localhost:8080/application.html` to start fresh.
4. Open the **Autofill** tab in the side panel.
5. Observe the matched fields and confidence percentages.
6. Click **Approve & Autofill Selected**.
7. Observe that the fields on the webpage are populated immediately, and the website's form state recognizes the values.

### Journey 4: Recovery Replay (Scenario E)
1. Complete Step 1 and click "Next Section" to advance to Step 2.
2. Complete Step 2 (College, Degree, Grad Year).
3. In the side panel Overview, click **Save Checkpoint**.
4. On the demo portal, click **⚡ Simulate Session Interruption** (or reload the browser tab).
5. The webpage reloads to Step 1.
6. Open the CarryON side panel and navigate to the **Recovery** tab.
7. Click **Restore Saved Progress**.
8. Observe that the previously saved data is restored into the webpage and verified.

### Journey 5: Contextual Field Guidance
1. On Step 3 (Experience), find the "Notice Period" field.
2. Open the **Assistant** tab in the side panel.
3. Click the starter prompt **"Explain this field"** or ask *"What does notice period mean?"*.
4. CarryON responds with a grounded explanation of notice periods and common examples (e.g. 15, 30, 60 days).
