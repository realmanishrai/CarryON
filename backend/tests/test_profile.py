def test_profile_lifecycle(client):
    # 1. Initially profile might be empty
    get_res = client.get("/profile")
    assert get_res.status_code == 200

    # 2. Create profile
    profile_data = {
        "full_name": "Alex Mercer",
        "email": "alex.mercer@example.com",
        "phone": "+1-555-0199",
        "college": "Apex Technical University",
        "degree": "B.S. Computer Science",
        "graduation_year": 2026,
        "skills": ["Python", "FastAPI", "React", "TypeScript"]
    }
    create_res = client.post("/profile", json=profile_data)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["full_name"] == "Alex Mercer"
    assert created["graduation_year"] == 2026
    assert len(created["skills"]) == 4

    # 3. Retrieve profile
    get_res2 = client.get("/profile")
    assert get_res2.status_code == 200
    retrieved = get_res2.json()
    assert retrieved["email"] == "alex.mercer@example.com"

    # 4. Update profile
    update_data = {
        "degree": "M.S. Artificial Intelligence",
        "graduation_year": 2027
    }
    put_res = client.put("/profile", json=update_data)
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["degree"] == "M.S. Artificial Intelligence"
    assert updated["graduation_year"] == 2027
    # full_name should remain intact
    assert updated["full_name"] == "Alex Mercer"

    # 5. Delete profile
    del_res = client.delete("/profile")
    assert del_res.status_code == 200
    
    # 6. Verify deletion
    get_res3 = client.get("/profile")
    assert get_res3.status_code == 200
    assert get_res3.json() is None
