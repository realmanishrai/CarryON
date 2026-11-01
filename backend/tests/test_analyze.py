def test_analyze_page_with_phone_error(client):
    payload = {
        "website_url": "http://localhost:8080/application.html",
        "page_title": "Apex Job Application",
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
                "carryon_id": "phone_number",
                "tag_name": "input",
                "label": "Phone Number",
                "required": True,
                "current_value": "abc123phone",  # Alphabetic in phone number!
                "value_present": True
            }
        ],
        "detected_errors": []
    }
    res = client.post("/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["page_status"] in ["blocked", "needs_attention"]
    assert len(data["issues"]) >= 1
    phone_issue = next((i for i in data["issues"] if i["field_id"] == "phone_number"), None)
    assert phone_issue is not None
    assert "alphabetic" in phone_issue["message"].lower() or "phone" in phone_issue["message"].lower()

def test_explain_field(client):
    payload = {
        "field_metadata": {
            "carryon_id": "notice_period",
            "tag_name": "input",
            "label": "Notice Period",
            "required": False,
            "placeholder": "e.g. 30 days"
        },
        "user_question": "What does notice period mean?"
    }
    res = client.post("/analyze/explain-field", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["field_id"] == "notice_period"
    assert "resignation" in data["explanation"].lower() or "working" in data["explanation"].lower() or "notice" in data["explanation"].lower()
    assert len(data["examples"]) > 0

def test_match_profile(client):
    # First save a profile
    client.post("/profile", json={
        "full_name": "Sarah Connor",
        "email": "sarah@skynet.com",
        "college": "MIT",
        "degree": "B.S. Robotics"
    })

    payload = {
        "fields": [
            {"carryon_id": "cand_name", "tag_name": "input", "label": "Full Name"},
            {"carryon_id": "inst_enrolled", "tag_name": "input", "label": "Institution currently enrolled in"},
            {"carryon_id": "contact_email", "tag_name": "input", "label": "Email Address"}
        ]
    }
    res = client.post("/analyze/match-profile", json=payload)
    assert res.status_code == 200
    data = res.json()
    matches = data["matches"]
    assert len(matches) >= 2
    matched_keys = [m["profile_key"] for m in matches]
    assert "full_name" in matched_keys
    assert "college" in matched_keys or "email" in matched_keys

def test_chat_endpoint(client):
    payload = {
        "message": "can you explain phone number field",
        "history": [],
        "fields": [
            {
                "carryon_id": "phone",
                "tag_name": "input",
                "label": "Phone Number *",
                "required": True,
                "current_value": "phone123"
            }
        ],
        "detected_errors": [
            {
                "field_id": "phone",
                "message": "Invalid phone number."
            }
        ]
    }
    res = client.post("/analyze/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "phone" in data["reply"].lower()
    assert data["field_id"] == "phone"

