import { describe, it, expect, beforeEach } from 'vitest';
import { DOMExtractor } from '../content/dom-extractor';

describe('DOMExtractor', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('extracts input fields with associated labels and attributes', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <div class="form-group">
          <label for="cand_name">Full Name *</label>
          <input type="text" id="cand_name" name="cand_name" required value="Rahul Sharma" />
        </div>
        <div class="form-group">
          <label for="phone_input">Phone Number</label>
          <input type="tel" id="phone_input" name="phone" placeholder="Digits only" />
        </div>
        <div class="form-group">
          <label for="notice_select">Notice Period</label>
          <select id="notice_select" name="notice_period">
            <option value="30">30 days</option>
          </select>
        </div>
      </form>
    `;

    const fields = DOMExtractor.extractAllFields();
    expect(fields.length).toBe(3);

    const nameField = fields.find((f) => f.id === 'cand_name');
    expect(nameField).toBeDefined();
    expect(nameField?.label).toBe('Full Name');
    expect(nameField?.required).toBe(true);
    expect(nameField?.current_value).toBe('Rahul Sharma');
    expect(nameField?.value_present).toBe(true);

    const phoneField = fields.find((f) => f.id === 'phone_input');
    expect(phoneField).toBeDefined();
    expect(phoneField?.input_type).toBe('tel');
    expect(phoneField?.placeholder).toBe('Digits only');
  });

  it('assigns and preserves stable data-carryon-id', () => {
    document.body.innerHTML = `
      <input type="text" id="test_input" />
    `;
    const input = document.getElementById('test_input')!;
    const id1 = DOMExtractor.getOrCreateFieldId(input);
    expect(id1).toBe('test_input');
    expect(input.getAttribute('data-carryon-id')).toBe('test_input');

    const id2 = DOMExtractor.getOrCreateFieldId(input);
    expect(id2).toBe(id1);
  });

  it('ignores password and hidden inputs for privacy', () => {
    document.body.innerHTML = `
      <input type="password" id="secret_pass" />
      <input type="hidden" name="csrf" value="123" />
      <input type="text" id="regular_input" />
    `;
    const fields = DOMExtractor.extractAllFields();
    expect(fields.length).toBe(1);
    expect(fields[0].id).toBe('regular_input');
  });
});
