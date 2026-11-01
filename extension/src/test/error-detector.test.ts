import { describe, it, expect } from 'vitest';
import { ErrorDetector } from '../content/error-detector';
import { DOMFieldMetadata } from '../shared/types';

describe('ErrorDetector', () => {
  it('detects invalid phone numbers containing alphabetic characters (Scenario A)', () => {
    const fields: DOMFieldMetadata[] = [
      {
        carryon_id: 'phone',
        tag_name: 'input',
        input_type: 'tel',
        label: 'Phone Number',
        required: true,
        value_present: true,
        current_value: 'phone123',
        disabled: false,
        readonly: false
      }
    ];

    const errors = ErrorDetector.detectErrors(fields);
    expect(errors.length).toBe(1);
    expect(errors[0].error_type).toBe('invalid_phone_alphabetic');
    expect(errors[0].field_id).toBe('phone');
    expect(errors[0].suggested_correction).toBe('123');
  });

  it('passes valid phone numbers without error', () => {
    const fields: DOMFieldMetadata[] = [
      {
        carryon_id: 'phone',
        tag_name: 'input',
        input_type: 'tel',
        label: 'Phone Number',
        required: true,
        value_present: true,
        current_value: '+1 (555) 234-5678',
        disabled: false,
        readonly: false
      }
    ];

    const errors = ErrorDetector.detectErrors(fields);
    expect(errors.length).toBe(0);
  });

  it('detects invalid negative years of experience (Scenario C)', () => {
    const fields: DOMFieldMetadata[] = [
      {
        carryon_id: 'experience_years',
        tag_name: 'input',
        input_type: 'number',
        label: 'Years of Experience',
        required: true,
        value_present: true,
        current_value: '-5',
        disabled: false,
        readonly: false
      }
    ];

    const errors = ErrorDetector.detectErrors(fields);
    expect(errors.length).toBe(1);
    expect(errors[0].error_type).toBe('invalid_experience_negative');
  });

  it('flags missing required fields if valueMissing is set (Scenario B)', () => {
    const fields: DOMFieldMetadata[] = [
      {
        carryon_id: 'full_name',
        tag_name: 'input',
        label: 'Full Name',
        required: true,
        value_present: false,
        current_value: '',
        validity_state: { valueMissing: true },
        disabled: false,
        readonly: false
      }
    ];

    const errors = ErrorDetector.detectErrors(fields);
    expect(errors.length).toBe(1);
    expect(errors[0].error_type).toBe('missing_required');
  });
});
