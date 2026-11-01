import { DOMExtractor } from './dom-extractor';
import { OverlayManager } from './overlay-manager';
import { ActionRecommendation, ActionType } from '../shared/types';
import { SUPPORTED_ACTIONS } from '../shared/constants';

export class DOMManipulator {
  /**
   * Smoothly scrolls an element into the center of the viewport and applies a subtle focus
   */
  static scrollToField(fieldId: string): boolean {
    const el = DOMExtractor.getElementById(fieldId);
    if (!el) return false;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    try {
      el.focus({ preventScroll: true });
    } catch (_) {}
    return true;
  }

  /**
   * Focuses a field
   */
  static focusField(fieldId: string): boolean {
    const el = DOMExtractor.getElementById(fieldId);
    if (!el) return false;
    try {
      el.focus();
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Validated safe action executor. Rejects unsupported actions or invalid fields.
   */
  static executeAction(action: ActionRecommendation): { success: boolean; message: string } {
    // 1. Validate action type is supported
    if (!SUPPORTED_ACTIONS.includes(action.action as any)) {
      return { success: false, message: `Unsupported action type: '${action.action}'` };
    }

    // 2. Validate field existence if field_id is specified
    if (action.field_id) {
      const el = DOMExtractor.getElementById(action.field_id);
      if (!el && action.action !== 'clean_overlays') {
        return { success: false, message: `Field with ID '${action.field_id}' was not found in the DOM.` };
      }
    }

    // 3. Dispatch safe predefined logic
    switch (action.action) {
      case 'highlight_field':
      case 'show_message':
        if (!action.field_id) return { success: false, message: 'field_id required for highlight' };
        if (!OverlayManager.highlightField(
          action.field_id,
          action.message || 'Validation attention required',
          action.severity || 'error'
        )) return { success: false, message: `Could not highlight field '${action.field_id}'.` };
        return { success: true, message: `Highlighted field ${action.field_id}` };

      case 'clear_highlight':
        if (action.field_id) {
          OverlayManager.clearHighlight(action.field_id);
        } else {
          OverlayManager.clearAllHighlights();
        }
        return { success: true, message: 'Cleared highlight' };

      case 'scroll_to_field':
      case 'focus_field':
        if (!action.field_id) return { success: false, message: 'field_id required for focus/scroll' };
        if (!this.scrollToField(action.field_id)) {
          return { success: false, message: `Could not locate field '${action.field_id}'.` };
        }
        return { success: true, message: `Focused field ${action.field_id}` };

      case 'clean_overlays':
        OverlayManager.clearAllHighlights();
        return { success: true, message: 'Cleaned all overlays' };

      default:
        return { success: false, message: `Action ${action.action} handled by specialized module.` };
    }
  }
}
