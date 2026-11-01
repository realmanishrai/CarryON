import re
from typing import List, Dict, Any, Optional
from ..schemas.analysis import DOMFieldMetadata, ActionRecommendation

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_LETTERS_REGEX = re.compile(r"[a-zA-Z]")
DIGITS_ONLY_REGEX = re.compile(r"\D")

class ValidationService:
    @staticmethod
    def validate_field(field: DOMFieldMetadata) -> Optional[Dict[str, Any]]:
        val = (field.current_value or "").strip()
        label_or_name = field.label or field.name or field.carryon_id

        # 1. Required field check
        if field.required and not val:
            return {
                "field_id": field.carryon_id,
                "field_label": label_or_name,
                "error_type": "missing_required",
                "message": f"{label_or_name} is required. Please fill in this field.",
                "severity": "error",
                "action": "highlight_field"
            }

        if not val:
            return None

        # 2. Email format validation
        is_email = (
            field.input_type == "email" or 
            "email" in (field.name or "").lower() or 
            "email" in (field.carryon_id or "").lower() or
            "email" in (field.label or "").lower()
        )
        if is_email and not EMAIL_REGEX.match(val):
            return {
                "field_id": field.carryon_id,
                "field_label": label_or_name,
                "error_type": "invalid_email",
                "message": f"Invalid email format: '{val}'. Please enter a valid email address (e.g. name@example.com).",
                "severity": "error",
                "action": "highlight_field"
            }

        # 3. Phone number validation (alphabetic characters detection)
        is_phone = (
            field.input_type == "tel" or 
            "phone" in (field.name or "").lower() or 
            "phone" in (field.carryon_id or "").lower() or
            "phone" in (field.label or "").lower() or
            "mobile" in (field.label or "").lower()
        )
        if is_phone:
            if PHONE_LETTERS_REGEX.search(val):
                return {
                    "field_id": field.carryon_id,
                    "field_label": label_or_name,
                    "error_type": "invalid_phone_alphabetic",
                    "message": "Invalid phone number. Phone numbers must not contain alphabetic characters. Enter digits only.",
                    "severity": "error",
                    "action": "highlight_field"
                }
            digits = DIGITS_ONLY_REGEX.sub("", val)
            if len(digits) < 7 or len(digits) > 15:
                return {
                    "field_id": field.carryon_id,
                    "field_label": label_or_name,
                    "error_type": "invalid_phone_length",
                    "message": "Invalid phone number length. A standard phone number has between 7 and 15 digits.",
                    "severity": "error",
                    "action": "highlight_field"
                }

        # 4. Years of experience validation
        is_experience = (
            "experience" in (field.name or "").lower() or 
            "experience" in (field.carryon_id or "").lower() or
            "experience" in (field.label or "").lower()
        )
        if is_experience:
            try:
                num = float(val)
                if num < 0:
                    return {
                        "field_id": field.carryon_id,
                        "field_label": label_or_name,
                        "error_type": "invalid_experience_negative",
                        "message": "Years of experience cannot be negative.",
                        "severity": "error",
                        "action": "highlight_field"
                    }
                if num > 50:
                    return {
                        "field_id": field.carryon_id,
                        "field_label": label_or_name,
                        "error_type": "invalid_experience_high",
                        "message": "Years of experience seems unusually high. Please confirm your input.",
                        "severity": "warning",
                        "action": "suggest_correction"
                    }
            except ValueError:
                return {
                    "field_id": field.carryon_id,
                    "field_label": label_or_name,
                    "error_type": "invalid_experience_format",
                    "message": "Please enter a valid numeric value for years of experience.",
                    "severity": "error",
                    "action": "highlight_field"
                }

        # 5. Graduation year validation
        is_grad_year = (
            "graduation" in (field.label or "").lower() or 
            "grad_year" in (field.name or "").lower() or
            "graduation_year" in (field.carryon_id or "").lower()
        )
        if is_grad_year:
            try:
                year = int(val)
                if year < 1960 or year > 2035:
                    return {
                        "field_id": field.carryon_id,
                        "field_label": label_or_name,
                        "error_type": "invalid_graduation_year",
                        "message": f"Graduation year ({year}) is outside typical range (1960-2035).",
                        "severity": "warning",
                        "action": "highlight_field"
                    }
            except ValueError:
                return {
                    "field_id": field.carryon_id,
                    "field_label": label_or_name,
                    "error_type": "invalid_grad_year_format",
                    "message": "Please enter a 4-digit graduation year.",
                    "severity": "error",
                    "action": "highlight_field"
                }

        # 6. Check DOM reported error message
        if field.error_message:
            return {
                "field_id": field.carryon_id,
                "field_label": label_or_name,
                "error_type": "dom_reported_error",
                "message": field.error_message,
                "severity": "error",
                "action": "highlight_field"
            }

        return None

    @classmethod
    def validate_fields(cls, fields: List[DOMFieldMetadata]) -> List[Dict[str, Any]]:
        errors = []
        for f in fields:
            err = cls.validate_field(f)
            if err:
                errors.append(err)
        return errors
