import { DOMFieldMetadata } from '../shared/types';

export class DOMExtractor {
  private static counter = 0;

  /**
   * Generates a stable identifier for a form element and tags the element with data-carryon-id
   */
  static getOrCreateFieldId(el: HTMLElement): string {
    const existing = el.getAttribute('data-carryon-id');
    if (existing) return existing;

    let id = el.id || el.getAttribute('name');
    if (!id) {
      // Build slug from label or placeholder
      const label = this.extractLabel(el);
      if (label) {
        id = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30);
      }
    }

    if (!id) {
      this.counter++;
      id = `field_${this.counter}`;
    }

    el.setAttribute('data-carryon-id', id);
    return id;
  }

  /**
   * Extracts the human-readable label associated with a field
   */
  static extractLabel(el: HTMLElement): string {
    // 1. Check aria-label
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel.trim();

    // 2. Check aria-labelledby
    const ariaLabelledBy = el.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelEl = document.getElementById(ariaLabelledBy);
      if (labelEl && labelEl.textContent) return labelEl.textContent.trim();
    }

    // 3. Check for <label for="element_id">
    if (el.id) {
      const labelEl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (labelEl && labelEl.textContent) {
        return labelEl.textContent.replace(/\*/g, '').trim();
      }
    }

    // 4. Check enclosing <label>
    const parentLabel = el.closest('label');
    if (parentLabel && parentLabel.textContent) {
      return parentLabel.textContent.replace(/\*/g, '').trim();
    }

    // 5. Check placeholder
    const placeholder = (el as HTMLInputElement).placeholder;
    if (placeholder) return placeholder.trim();

    // 6. Check name attribute
    const name = el.getAttribute('name');
    if (name) {
      return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return '';
  }

  /**
   * Finds any error message container adjacent to or associated with this field
   */
  static findFieldErrorMessage(el: HTMLElement): string | undefined {
    // Check aria-errormessage
    const ariaErrId = el.getAttribute('aria-errormessage');
    if (ariaErrId) {
      const errEl = document.getElementById(ariaErrId);
      if (errEl && errEl.textContent?.trim()) return errEl.textContent.trim();
    }

    // Check sibling or container for .error-text or [role="alert"]
    const parent = el.closest('.form-group') || el.parentElement;
    if (parent) {
      const errEl = parent.querySelector('.error-text, .error-message, [role="alert"]');
      if (errEl && errEl.textContent?.trim()) {
        return errEl.textContent.trim();
      }
    }

    // Check native browser validationMessage
    if ((el as HTMLInputElement).validationMessage) {
      return (el as HTMLInputElement).validationMessage;
    }

    return undefined;
  }

  /**
   * Scans document and extracts metadata for all editable form fields
   */
  static extractAllFields(): DOMFieldMetadata[] {
    const selector = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="password"]), select, textarea';
    const elements = Array.from(document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(selector));

    return elements
      .filter((el) => {
        // Exclude CarryON's own injected UI
        if (el.closest('[data-carryon-overlay]') || el.closest('[data-carryon-ignore]')) {
          return false;
        }
        return true;
      })
      .map((el) => {
        const carryon_id = this.getOrCreateFieldId(el);
        const label = this.extractLabel(el);
        const tagName = el.tagName.toLowerCase();
        const inputType = el.getAttribute('type') || (tagName === 'textarea' ? 'textarea' : tagName === 'select' ? 'select' : 'text');
        const required = el.required || el.getAttribute('aria-required') === 'true';
        const val = el.value || '';
        const value_present = val.trim().length > 0;
        const errMessage = this.findFieldErrorMessage(el);

        // Section / Step detection
        const sectionEl = el.closest('section[data-section-name], [data-step-name], fieldset');
        const sectionName = sectionEl?.getAttribute('data-section-name') ||
                            sectionEl?.getAttribute('data-step-name') ||
                            sectionEl?.querySelector('legend, h2, h3')?.textContent?.trim() ||
                            undefined;

        // Validity state
        let validity_state: Record<string, boolean> | undefined = undefined;
        if (el.validity) {
          validity_state = {
            valid: el.validity.valid,
            valueMissing: el.validity.valueMissing,
            typeMismatch: el.validity.typeMismatch,
            patternMismatch: el.validity.patternMismatch
          };
        }

        return {
          carryon_id,
          tag_name: tagName,
          input_type: inputType,
          label,
          name: el.name || undefined,
          id: el.id || undefined,
          placeholder: (el as HTMLInputElement).placeholder || undefined,
          required,
          value_present,
          current_value: val,
          validity_state,
          error_message: errMessage,
          section: sectionName,
          disabled: el.disabled,
          readonly: el.readOnly
        };
      });
  }

  /**
   * Locates a DOM element by its carryon_id
   */
  static getElementById(carryonId: string): HTMLElement | null {
    return document.querySelector(`[data-carryon-id="${CSS.escape(carryonId)}"]`);
  }
}
