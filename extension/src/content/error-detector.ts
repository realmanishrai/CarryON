import { DOMFieldMetadata, DetectedError } from '../shared/types';

export class ErrorDetector {
  private static EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  private static PHONE_LETTERS_REGEX = /[a-zA-Z]/;

  static detectErrors(fields: DOMFieldMetadata[]): DetectedError[] {
    const errors: DetectedError[] = [];

    for (const f of fields) {
      const val = (f.current_value || '').trim();
      const label = f.label || f.name || f.carryon_id;

      // 1. Required field empty check
      if (f.required && !val && !f.disabled && !f.readonly) {
        // Only flag if field has been interacted with, or in submission check
        if (f.validity_state?.valueMissing || f.error_message) {
          errors.push({
            field_id: f.carryon_id,
            field_label: label,
            error_type: 'missing_required',
            message: `${label} is required. Please fill in this field.`,
            severity: 'error',
            action: 'highlight_field'
          });
          continue;
        }
      }

      if (!val) continue;

      // 2. Phone number validation (SCENARIO A)
      const isPhone = (
        f.input_type === 'tel' ||
        f.carryon_id.toLowerCase().includes('phone') ||
        (f.name && f.name.toLowerCase().includes('phone')) ||
        (f.label && f.label.toLowerCase().includes('phone'))
      );

      if (isPhone) {
        if (this.PHONE_LETTERS_REGEX.test(val)) {
          errors.push({
            field_id: f.carryon_id,
            field_label: label,
            error_type: 'invalid_phone_alphabetic',
            message: 'Invalid phone number. Alphabetic characters are not allowed. Please enter digits only.',
            severity: 'error',
            action: 'highlight_field',
            suggested_correction: val.replace(/[a-zA-Z]/g, '')
          });
          continue;
        }
        const digits = val.replace(/\D/g, '');
        if (digits.length < 7 || digits.length > 15) {
          errors.push({
            field_id: f.carryon_id,
            field_label: label,
            error_type: 'invalid_phone_length',
            message: 'Phone number length is unusual. Standard numbers have between 7 and 15 digits.',
            severity: 'error',
            action: 'highlight_field'
          });
          continue;
        }
      }

      // 3. Email validation
      const isEmail = (
        f.input_type === 'email' ||
        f.carryon_id.toLowerCase().includes('email') ||
        (f.name && f.name.toLowerCase().includes('email')) ||
        (f.label && f.label.toLowerCase().includes('email'))
      );

      if (isEmail && !this.EMAIL_REGEX.test(val)) {
        errors.push({
          field_id: f.carryon_id,
          field_label: label,
          error_type: 'invalid_email',
          message: `Invalid email address: '${val}'. Format should be name@domain.com.`,
          severity: 'error',
          action: 'highlight_field'
        });
        continue;
      }

      // 4. Years of experience validation (SCENARIO C)
      const isExperience = (
        f.carryon_id.toLowerCase().includes('experience') ||
        (f.name && f.name.toLowerCase().includes('experience')) ||
        (f.label && f.label.toLowerCase().includes('experience'))
      );

      if (isExperience) {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0) {
          errors.push({
            field_id: f.carryon_id,
            field_label: label,
            error_type: 'invalid_experience_negative',
            message: 'Years of experience cannot be negative. Please enter 0 or greater.',
            severity: 'error',
            action: 'highlight_field',
            suggested_correction: '0'
          });
          continue;
        }
      }

      // 5. Existing DOM-level error message
      if (f.error_message && f.error_message.trim().length > 0) {
        // Avoid duplicate if already caught
        if (!errors.some((e) => e.field_id === f.carryon_id)) {
          errors.push({
            field_id: f.carryon_id,
            field_label: label,
            error_type: 'dom_error',
            message: f.error_message,
            severity: 'error',
            action: 'highlight_field'
          });
        }
      }
    }

    return errors;
  }
}
