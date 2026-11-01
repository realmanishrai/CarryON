from backend.services.ai_service import AIService
from backend.services.validation_service import ValidationService
from backend.schemas.analysis import DOMFieldMetadata

def test_validation_service_phone_alphabetic():
    field = DOMFieldMetadata(
        carryon_id="phone",
        tag_name="input",
        input_type="tel",
        label="Phone Number",
        required=True,
        current_value="12345abcde"
    )
    err = ValidationService.validate_field(field)
    assert err is not None
    assert err["error_type"] == "invalid_phone_alphabetic"

def test_validation_service_valid_phone():
    field = DOMFieldMetadata(
        carryon_id="phone",
        tag_name="input",
        input_type="tel",
        label="Phone Number",
        required=True,
        current_value="+1 (555) 234-5678"
    )
    err = ValidationService.validate_field(field)
    assert err is None

def test_validation_service_negative_experience():
    field = DOMFieldMetadata(
        carryon_id="experience_years",
        tag_name="input",
        input_type="number",
        label="Years of Experience",
        required=True,
        current_value="-3"
    )
    err = ValidationService.validate_field(field)
    assert err is not None
    assert err["error_type"] == "invalid_experience_negative"

def test_validation_service_missing_required():
    field = DOMFieldMetadata(
        carryon_id="full_name",
        tag_name="input",
        label="Full Name",
        required=True,
        current_value=""
    )
    err = ValidationService.validate_field(field)
    assert err is not None
    assert err["error_type"] == "missing_required"

def test_ai_service_handles_missing_api_key():
    ai = AIService()
    ai.api_key = None
    ai._client = None
    assert ai.is_ai_available() is False
