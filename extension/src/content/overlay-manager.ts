import { DOMExtractor } from './dom-extractor';

export class OverlayManager {
  private static originalStyles = new Map<HTMLElement, { border: string; boxShadow: string; outline: string }>();

  /**
   * Highlights a field with a red border and attaches an isolated inline tooltip card
   */
  static highlightField(fieldId: string, message: string, severity: 'info' | 'warning' | 'error' = 'error'): boolean {
    const el = DOMExtractor.getElementById(fieldId);
    if (!el) return false;

    // Save original styles if not already saved
    if (!this.originalStyles.has(el)) {
      this.originalStyles.set(el, {
        border: el.style.border,
        boxShadow: el.style.boxShadow,
        outline: el.style.outline
      });
    }

    // Apply inline style highlighting
    const highlightColor = severity === 'error' ? '#EF4444' : severity === 'warning' ? '#FFD500' : '#00DDF5';
    el.style.border = `2px solid ${highlightColor}`;
    el.style.boxShadow = `0 0 10px ${highlightColor}66`;
    el.style.outline = 'none';
    el.setAttribute('data-carryon-highlighted', 'true');

    // Remove existing overlay for this field if any
    this.removeOverlayCard(fieldId);

    // Create isolated overlay container
    const container = document.createElement('div');
    container.setAttribute('data-carryon-overlay', 'true');
    container.setAttribute('data-carryon-field-id', fieldId);
    container.style.cssText = `
      position: relative;
      display: block;
      margin-top: 6px;
      margin-bottom: 6px;
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    // Attach Shadow DOM for style isolation
    let shadow: ShadowRoot;
    try {
      shadow = container.attachShadow({ mode: 'open' });
    } catch (_) {
      // Fallback if shadow DOM is restricted
      shadow = container as any;
    }

    const card = document.createElement('div');
    card.className = 'carryon-error-card';
    card.innerHTML = `
      <style>
        .carryon-error-card {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #091523;
          color: #F4F8FF;
          border: 1px solid ${highlightColor};
          border-left: 4px solid ${highlightColor};
          border-radius: 8px;
          padding: 10px 14px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
          font-size: 13px;
          line-height: 1.4;
          animation: carryonFadeIn 0.2s ease-out;
        }
        @keyframes carryonFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .carryon-icon {
          flex-shrink: 0;
          font-size: 15px;
          margin-top: 1px;
        }
        .carryon-content {
          flex: 1;
        }
        .carryon-title {
          font-weight: 600;
          color: ${highlightColor};
          margin-bottom: 2px;
        }
        .carryon-msg {
          color: #A9BED3;
        }
        .carryon-close {
          background: transparent;
          border: none;
          color: #71869C;
          cursor: pointer;
          font-size: 14px;
          padding: 0 4px;
          line-height: 1;
        }
        .carryon-close:hover {
          color: #F4F8FF;
        }
      </style>
      <span class="carryon-icon">${severity === 'error' ? '⚠️' : 'ℹ️'}</span>
      <div class="carryon-content">
        <div class="carryon-title">CarryON AI Diagnostic</div>
        <div class="carryon-msg">${this.escapeHTML(message)}</div>
      </div>
      <button type="button" class="carryon-close" title="Dismiss highlight">&times;</button>
    `;

    const closeBtn = card.querySelector('.carryon-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.clearHighlight(fieldId);
      });
    }

    // Insert overlay right after the form element or its immediate parent container
    const parentContainer = el.closest('.form-group') || el.parentElement || el;
    parentContainer.insertAdjacentElement('afterend', container);

    return true;
  }

  /**
   * Removes overlay card and restores original field styles
   */
  static clearHighlight(fieldId: string): void {
    const el = DOMExtractor.getElementById(fieldId);
    if (el) {
      const orig = this.originalStyles.get(el);
      if (orig) {
        el.style.border = orig.border;
        el.style.boxShadow = orig.boxShadow;
        el.style.outline = orig.outline;
        this.originalStyles.delete(el);
      } else {
        el.style.border = '';
        el.style.boxShadow = '';
        el.style.outline = '';
      }
      el.removeAttribute('data-carryon-highlighted');
    }
    this.removeOverlayCard(fieldId);
  }

  /**
   * Removes overlay element by fieldId
   */
  private static removeOverlayCard(fieldId: string): void {
    const existing = document.querySelector(`[data-carryon-overlay][data-carryon-field-id="${CSS.escape(fieldId)}"]`);
    if (existing && existing.parentElement) {
      existing.parentElement.removeChild(existing);
    }
  }

  /**
   * Cleans all highlights and overlays across the page
   */
  static clearAllHighlights(): void {
    // Restore styles on all tracked elements
    this.originalStyles.forEach((orig, el) => {
      el.style.border = orig.border;
      el.style.boxShadow = orig.boxShadow;
      el.style.outline = orig.outline;
      el.removeAttribute('data-carryon-highlighted');
    });
    this.originalStyles.clear();

    // Remove all overlay DOM nodes
    document.querySelectorAll('[data-carryon-overlay]').forEach((node) => {
      node.remove();
    });
  }

  private static escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
