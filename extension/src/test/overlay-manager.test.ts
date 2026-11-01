import { describe, it, expect, beforeEach } from 'vitest';
import { OverlayManager } from '../content/overlay-manager';

describe('OverlayManager', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="form-group">
        <label for="phone">Phone Number</label>
        <input type="tel" id="phone" data-carryon-id="phone" />
      </div>
    `;
  });

  it('highlights problematic field and injects isolated overlay', () => {
    const success = OverlayManager.highlightField('phone', 'Phone cannot contain letters.', 'error');
    expect(success).toBe(true);

    const input = document.getElementById('phone')!;
    expect(input.getAttribute('data-carryon-highlighted')).toBe('true');
    expect(input.style.border).toContain('rgb(239, 68, 68)');

    const overlay = document.querySelector('[data-carryon-overlay][data-carryon-field-id="phone"]');
    expect(overlay).not.toBeNull();
  });

  it('clears highlight and removes injected overlay cleanly', () => {
    OverlayManager.highlightField('phone', 'Test error', 'error');
    expect(document.querySelector('[data-carryon-overlay]')).not.toBeNull();

    OverlayManager.clearHighlight('phone');

    const input = document.getElementById('phone')!;
    expect(input.getAttribute('data-carryon-highlighted')).toBeNull();
    expect(document.querySelector('[data-carryon-overlay]')).toBeNull();
  });

  it('clears all highlights across the page', () => {
    OverlayManager.highlightField('phone', 'Error 1', 'error');
    OverlayManager.clearAllHighlights();

    expect(document.querySelectorAll('[data-carryon-overlay]').length).toBe(0);
  });
});
