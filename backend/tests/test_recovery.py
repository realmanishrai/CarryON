def test_recover_diagnose_and_verify(client):
    # 1. Diagnose issues
    req_payload = {
        "website_url": "http://localhost:8080/application.html",
        "current_step": 3,
        "fields": [],
        "errors": [
            {
                "field_id": "years_experience",
                "message": "Years of experience cannot be negative.",
                "severity": "error"
            }
        ]
    }
    rec_res = client.post("/recover", json=req_payload)
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert rec_data["status"] == "diagnosed"
    assert len(rec_data["blockers"]) == 1
    assert rec_data["blockers"][0]["field_id"] == "years_experience"

    # 2. Verify recovery when value is successfully corrected
    verify_payload = {
        "field_id": "years_experience",
        "expected_value": "3",
        "actual_value": "3",
        "form_validity": True
    }
    v_res = client.post("/recover/verify", json=verify_payload)
    assert v_res.status_code == 200
    v_data = v_res.json()
    assert v_data["is_resolved"] is True
    assert v_data["current_step_valid"] is True

    # 3. Verify failure when actual value does not match expected
    verify_fail = {
        "field_id": "years_experience",
        "expected_value": "3",
        "actual_value": "-1",
        "form_validity": False
    }
    v_fail_res = client.post("/recover/verify", json=verify_fail)
    assert v_fail_res.status_code == 200
    assert v_fail_res.json()["is_resolved"] is False
