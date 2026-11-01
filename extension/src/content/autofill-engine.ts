import { DOMExtractor } from './dom-extractor';
import { OverlayManager } from './overlay-manager';

export interface FillResult {
  field_id: string;
  success: boolean;
  message: string;
  actual_value?: string;
}

export class AutofillEngine {
  private static SENSITIVE_KEYWORDS = ['password', 'otp', 'token', 'cvv', 'credit_card', 'ssn', 'pin'];

  /**
   * Sets value on an input/select/textarea using native setter and dispatches synthetic events
   */
  static fillField(fieldId: string, value: string): FillResult {
    const el = DOMExtractor.getElementById(fieldId) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;

    if (!el) {
      return {
        field_id: fieldId,
        success: false,
        message: `Field '${fieldId}' not found in the current webpage.`
      };
    }

    // Safety check: sensitive fields
    const idAndName = `${el.id || ''} ${el.name || ''} ${fieldId}`.toLowerCase();
    if (this.SENSITIVE_KEYWORDS.some((kw) => idAndName.includes(kw))) {
      return {
        field_id: fieldId,
        success: false,
        message: 'Security policy: Autofill is strictly forbidden on sensitive fields (passwords, OTPs, payment data).'
      };
    }

    if (el.disabled || el.readOnly) {
      return {
        field_id: fieldId,
        success: false,
        message: `Field '${fieldId}' is disabled or read-only.`
      };
    }

    try {
      // Use native value setter so React/Vue/Angular controlled components notice the change
      const prototype = Object.getPrototypeOf(el);
      const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

      if (prototypeValueSetter) {
        prototypeValueSetter.call(el, value);
      } else {
        el.value = value;
      }

      // Dispatch standard browser events with bubbles
      el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));

      // Clear any prior error highlight if the field is now filled/valid
      OverlayManager.clearHighlight(fieldId);

      return {
        field_id: fieldId,
        success: true,
        message: `Field '${fieldId}' autofilled successfully.`,
        actual_value: el.value
      };
    } catch (e: any) {
      return {
        field_id: fieldId,
        success: false,
        message: `Failed to fill field '${fieldId}': ${e.message}`
      };
    }
  }

  /**
   * Fills multiple approved fields sequentially and returns the aggregated results
   */
  static fillMultiple(fields: Array<{ field_id: string; value: string }>): FillResult[] {
    return fields.map((f) => this.fillField(f.field_id, f.value));
  }
}
