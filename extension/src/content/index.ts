import { DOMExtractor } from './dom-extractor';
import { ErrorDetector } from './error-detector';
import { DOMManipulator } from './dom-manipulator';
import { OverlayManager } from './overlay-manager';
import { AutofillEngine } from './autofill-engine';
import { DOMObserver } from './dom-observer';
import { MSG_TYPES, ExtensionMessage } from '../shared/messages';
import { PageScanResult } from '../shared/types';

function performScan(): PageScanResult {
  const fields = DOMExtractor.extractAllFields();
  const errors = ErrorDetector.detectErrors(fields);

  // Check demo website step or generic multi-step attributes
  let currentStep = 1;
  let totalSteps = 1;

  const demoState = (window as any).__CARRYON_DEMO_STATE__;
  if (demoState) {
    currentStep = demoState.currentStep || 1;
    totalSteps = demoState.totalSteps || 5;
  } else {
    // Infer from active section or breadcrumb
    const activeSection = document.querySelector('.form-step.active, section.active, [aria-current="step"]');
    if (activeSection) {
      const stepAttr = activeSection.getAttribute('data-step') || activeSection.id.match(/\d+/)?.[0];
      if (stepAttr) currentStep = parseInt(stepAttr, 10);
    }
    const allSteps = document.querySelectorAll('.form-step, .step-item, fieldset');
    if (allSteps.length > 0) totalSteps = allSteps.length;
  }

  return {
    url: window.location.href,
    title: document.title,
    fields,
    errors,
    currentStep,
    totalSteps: Math.max(totalSteps, currentStep),
    timestamp: Date.now()
  };
}

// The extension can be reloaded while the page stays open. In that case the
// page's isolated world may still contain the initialization flag, while the
// old extension message listener is gone. Always register the listener for
// the current extension context; only the observers need one-time setup.
if (!(window as any).__CARRYON_CONTENT_INITIALIZED__) {
  (window as any).__CARRYON_CONTENT_INITIALIZED__ = true;
  console.log('[CarryON AI] Content script initialized on:', window.location.href);

  // Initialize DOM observer to detect changes on page
  const observer = new DOMObserver(() => {
    try {
      const scan = performScan();
      chrome.runtime.sendMessage({
        type: MSG_TYPES.STEP_CHANGED,
        payload: scan
      }).catch(() => {
        // Side panel may be closed, ignore
      });
    } catch (_) {}
  }, 400);

  observer.start();

  // Listen for demo page custom step change event
  window.addEventListener('carryon-step-changed', () => {
    try {
      const scan = performScan();
      chrome.runtime.sendMessage({
        type: MSG_TYPES.STEP_CHANGED,
        payload: scan
      }).catch(() => {});
    } catch (_) {}
  });

}

// Register on every injection, including reinjection after an extension
// reload where the one-time DOM observer above is already present.
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  switch (message.type) {
    case MSG_TYPES.PING:
      sendResponse({ status: 'PONG' });
      return true;

    case MSG_TYPES.SCAN_PAGE: {
      const scan = performScan();
      sendResponse(scan);
      return true;
    }

    case MSG_TYPES.EXECUTE_ACTION: {
      const res = DOMManipulator.executeAction(message.payload);
      sendResponse(res);
      return true;
    }

    case MSG_TYPES.AUTOFILL_FIELDS: {
      const fieldsToFill = message.payload?.fields || [];
      const results = AutofillEngine.fillMultiple(fieldsToFill);
      sendResponse({ results });
      return true;
    }

    case MSG_TYPES.RESTORE_FIELDS: {
      const dict = message.payload?.fields || {};
      const fieldsList = Object.keys(dict).map((fid) => ({
        field_id: fid,
        value: String(dict[fid])
      }));
      const results = AutofillEngine.fillMultiple(fieldsList);
      sendResponse({ results });
      return true;
    }

    case MSG_TYPES.CLEAR_ALL_HIGHLIGHTS: {
      OverlayManager.clearAllHighlights();
      sendResponse({ success: true });
      return true;
    }

    default:
      return false;
  }
});

