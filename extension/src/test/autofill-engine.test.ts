import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AutofillEngine } from '../content/autofill-engine';

describe('AutofillEngine', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="test-form">
        <input type="text" id="full_name" data-carryon-id="full_name" value="" />
        <input type="password" id="secret_token" data-carryon-id="secret_token" value="" />
        <input type="text" id="disabled_field" data-carryon-id="disabled_field" disabled value="" />
      </form>
    `;
  });

  it('autofills approved field and fires input and change events', () => {
    const input = document.getElementById('full_name') as HTMLInputElement;
    const inputSpy = vi.fn();
    const changeSpy = vi.fn();

    input.addEventListener('input', inputSpy);
    input.addEventListener('change', changeSpy);

    const result = AutofillEngine.fillField('full_name', 'Rahul Sharma');
    expect(result.success).toBe(true);
    expect(input.value).toBe('Rahul Sharma');
    expect(inputSpy).toHaveBeenCalled();
    expect(changeSpy).toHaveBeenCalled();
  });

  it('rejects autofill on sensitive fields (passwords, tokens, OTPs)', () => {
    const result = AutofillEngine.fillField('secret_token', 'my-password');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Security policy');
  });

  it('rejects autofill on disabled or read-only fields', () => {
    const result = AutofillEngine.fillField('disabled_field', 'test');
    expect(result.success).toBe(false);
    expect(result.message).toContain('disabled or read-only');
  });

  it('rejects non-existent field identifiers safely', () => {
    const result = AutofillEngine.fillField('non_existent_id', 'test');
    expect(result.success).toBe(false);
    expect(result.message).toContain('not found');
  });
});
