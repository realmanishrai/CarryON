import pytest

def test_complete_e2e_user_journey(client):
    """
    Simulates the 5 complete user journeys end-to-end:
    Journey 1: Basic application understanding
    Journey 2: Error detection and DOM intervention (Phone alphabet error)
    Journey 3: Smart autofill (Profile creation & matching)
    Journey 4: Recovery Replay (Save checkpoint, simulate crash, restore)
    Journey 5: AI diagnosis and verification
    """
    # -------------------------------------------------------------
    # Journey 1: Basic application understanding
    # -------------------------------------------------------------
    wf_payload = {
        "title": "Senior Software Engineer Application",
        "website_url": "http://localhost:8080/application.html",
        "status": "in_progress",
        "current_step": 1,
        "total_steps": 5,
        "steps": [
            {"step_index": 1, "title": "Personal Information", "status": "in_progress"},
            {"step_index": 2, "title": "Education", "status": "pending"},
            {"step_index": 3, "title": "Experience", "status": "pending"},
            {"step_index": 4, "title": "Skills and Resume", "status": "pending"},
            {"step_index": 5, "title": "Review and Submit", "status": "pending"}
        ]
    }
    wf_res = client.post("/workflow/create", json=wf_payload)
    assert wf_res.status_code == 201
    workflow = wf_res.json()
    wf_id = workflow["id"]

    # -------------------------------------------------------------
    # Journey 2: Error detection & DOM intervention
    # -------------------------------------------------------------
    scan_step1_error = {
        "website_url": "http://localhost:8080/application.html",
        "page_title": "Apex Careers",
        "current_step": 1,
        "fields": [
            {
                "carryon_id": "full_name",
                "tag_name": "input",
                "label": "Full Name",
                "required": True,
                "current_value": "Alex Mercer",
                "value_present": True
            },
            {
                "carryon_id": "email",
                "tag_name": "input",
                "label": "Email Address",
                "required": True,
                "current_value": "alex@example.com",
                "value_present": True
            },
            {
                "carryon_id": "phone",
                "tag_name": "input",
                "label": "Phone Number",
                "required": True,
                "current_value": "phone99123",  # Invalid phone with letters
                "value_present": True
            }
        ]
    }
    analyze_res = client.post("/analyze", json=scan_step1_error)
    assert analyze_res.status_code == 200
    analysis = analyze_res.json()
    assert analysis["page_status"] in ["blocked", "needs_attention"]
    phone_issue = next((i for i in analysis["issues"] if i["field_id"] == "phone"), None)
    assert phone_issue is not None
    assert "alphabetic" in phone_issue["message"].lower()

    # -------------------------------------------------------------
    # Journey 3: Smart autofill (Profile creation & matching)
    # -------------------------------------------------------------
    profile_data = {
        "full_name": "Alex Mercer",
        "email": "alex@example.com",
        "phone": "+1-555-0199",
        "college": "Stanford University",
        "degree": "B.S. Computer Science",
        "graduation_year": 2026,
        "skills": ["Python", "React", "TypeScript", "FastAPI"]
    }
    prof_res = client.post("/profile", json=profile_data)
    assert prof_res.status_code == 201

    match_req = {
        "fields": [
            {"carryon_id": "full_name", "tag_name": "input", "label": "Full Name"},
            {"carryon_id": "college", "tag_name": "input", "label": "College / University"},
            {"carryon_id": "degree", "tag_name": "input", "label": "Degree & Major"},
            {"carryon_id": "skills", "tag_name": "input", "label": "Technical Skills"}
        ]
    }
    match_res = client.post("/analyze/match-profile", json=match_req)
    assert match_res.status_code == 200
    matched = match_res.json()["matches"]
    assert len(matched) >= 3
    matched_fids = [m["field_id"] for m in matched]
    assert "full_name" in matched_fids
    assert "college" in matched_fids
    assert "degree" in matched_fids

    # -------------------------------------------------------------
    # Journey 4: Recovery Replay (Save checkpoint, simulate crash, restore)
    # -------------------------------------------------------------
    checkpoint_payload = {
        "workflow_id": wf_id,
        "step_index": 2,
        "state_snapshot": {
            "full_name": "Alex Mercer",
            "email": "alex@example.com",
            "phone": "+1-555-0199",
            "college": "Stanford University",
            "degree": "B.S. Computer Science",
            "graduation_year": "2026"
        }
    }
    cp_res = client.post(f"/workflow/{wf_id}/checkpoint", json=checkpoint_payload)
    assert cp_res.status_code == 201

    # Simulate crash / reload: request restoration plan
    restore_res = client.post(f"/workflow/{wf_id}/restore")
    assert restore_res.status_code == 200
    plan = restore_res.json()
    assert plan["workflow_id"] == wf_id
    assert plan["step_index"] == 2
    assert plan["fields_to_restore"]["college"] == "Stanford University"
    assert plan["fields_to_restore"]["degree"] == "B.S. Computer Science"

    # -------------------------------------------------------------
    # Journey 5: AI diagnosis and verification
    # -------------------------------------------------------------
    rec_diag_req = {
        "website_url": "http://localhost:8080/application.html",
        "current_step": 3,
        "fields": [],
        "errors": [
            {
                "field_id": "experience_years",
                "message": "Years of experience cannot be negative.",
                "severity": "error"
            }
        ]
    }
    diag_res = client.post("/recover", json=rec_diag_req)
    assert diag_res.status_code == 200
    assert diag_res.json()["status"] == "diagnosed"

    # Verify recovery action
    verify_req = {
        "workflow_id": wf_id,
        "field_id": "experience_years",
        "expected_value": "3",
        "actual_value": "3",
        "form_validity": True
    }
    v_res = client.post("/recover/verify", json=verify_req)
    assert v_res.status_code == 200
    assert v_res.json()["is_resolved"] is True
