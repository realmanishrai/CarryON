def test_workflow_lifecycle_and_checkpoints(client):
    # 1. Create a workflow
    wf_payload = {
        "title": "Senior Frontend Engineer Application",
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
    create_res = client.post("/workflow/create", json=wf_payload)
    assert create_res.status_code == 201
    wf = create_res.json()
    wf_id = wf["id"]
    assert wf["title"] == "Senior Frontend Engineer Application"
    assert len(wf["steps"]) == 5

    # 2. Retrieve workflow by ID
    get_res = client.get(f"/workflow/{wf_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == wf_id

    # 3. List workflows
    list_res = client.get("/workflow")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 4. Save checkpoint for step 1
    cp_payload = {
        "workflow_id": wf_id,
        "step_index": 1,
        "state_snapshot": {
            "full_name": "Jordan Lee",
            "email": "jordan@example.com",
            "phone": "+1-555-0144"
        }
    }
    cp_res = client.post(f"/workflow/{wf_id}/checkpoint", json=cp_payload)
    assert cp_res.status_code == 201
    cp = cp_res.json()
    assert cp["step_index"] == 1
    assert cp["state_snapshot"]["full_name"] == "Jordan Lee"

    # 5. List checkpoints
    cps_res = client.get(f"/workflow/{wf_id}/checkpoints")
    assert cps_res.status_code == 200
    assert len(cps_res.json()) == 1

    # 6. Prepare restore plan
    restore_res = client.post(f"/workflow/{wf_id}/restore")
    assert restore_res.status_code == 200
    plan = restore_res.json()
    assert plan["workflow_id"] == wf_id
    assert "full_name" in plan["fields_to_restore"]
    assert plan["fields_to_restore"]["full_name"] == "Jordan Lee"

    # 7. Update workflow status
    update_res = client.put(f"/workflow/{wf_id}", json={"current_step": 2, "status": "in_progress"})
    assert update_res.status_code == 200
    assert update_res.json()["current_step"] == 2

    # 8. Delete workflow
    del_res = client.delete(f"/workflow/{wf_id}")
    assert del_res.status_code == 200

    # 9. Verify 404 after deletion
    get_deleted = client.get(f"/workflow/{wf_id}")
    assert get_deleted.status_code == 404
