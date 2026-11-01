export class DOMObserver {
  private observer: MutationObserver | null = null;
  private debounceTimer: number | null = null;
  private onChangeCallback: () => void;
  private debounceMs: number;

  constructor(onChange: () => void, debounceMs = 300) {
    this.onChangeCallback = onChange;
    this.debounceMs = debounceMs;
  }

  start(): void {
    if (this.observer) return;

    this.observer = new MutationObserver((mutations) => {
      // Check if all mutations originated from CarryON's injected overlays
      const isCarryOnMutationOnly = mutations.every((m) => {
        const targetEl = m.target as HTMLElement;
        if (targetEl && (targetEl.hasAttribute?.('data-carryon-overlay') || targetEl.closest?.('[data-carryon-overlay]'))) {
          return true;
        }
        for (let i = 0; i < m.addedNodes.length; i++) {
          const node = m.addedNodes[i] as HTMLElement;
          if (node.nodeType === Node.ELEMENT_NODE && (node.hasAttribute?.('data-carryon-overlay') || node.closest?.('[data-carryon-overlay]'))) {
            return true;
          }
        }
        return false;
      });

      if (isCarryOnMutationOnly) {
        return; // Avoid infinite observation loop!
      }

      this.triggerDebounced();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'disabled', 'hidden']
    });

    // Also listen for form input / change events
    document.addEventListener('input', this.handleInputEvent, true);
    document.addEventListener('change', this.handleInputEvent, true);
  }

  private handleInputEvent = (e: Event): void => {
    const target = e.target as HTMLElement;
    if (target && target.closest?.('[data-carryon-overlay]')) return;
    this.triggerDebounced();
  };

  private triggerDebounced(): void {
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = window.setTimeout(() => {
      this.debounceTimer = null;
      this.onChangeCallback();
    }, this.debounceMs);
  }

  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    document.removeEventListener('input', this.handleInputEvent, true);
    document.removeEventListener('change', this.handleInputEvent, true);
  }
}
