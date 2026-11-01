import { useState, useEffect, useCallback } from 'react';
import { PageScanResult, Workflow, DetectedError, DOMFieldMetadata } from '../../shared/types';
import { MSG_TYPES } from '../../shared/messages';
import { ApiService } from '../../utils/api';
import { StorageUtil } from '../../utils/storage';
import { STORAGE_KEYS } from '../../shared/constants';

export function useWorkflow() {
  const [scanResult, setScanResult] = useState<PageScanResult | null>(null);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [aiStatus, setAiStatus] = useState<string>('unknown');
  const [activeTabId, setActiveTabId] = useState<number | null>(null);

  // Helper to reliably find the active browser tab even when focus is in the side panel
  const getActiveTab = useCallback(async (): Promise<chrome.tabs.Tab | null> => {
    if (typeof chrome === 'undefined' || !chrome.tabs) return null;

    try {
      // 1. Try lastFocusedWindow first (standard for Chrome side panels)
      let tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      if (tabs && tabs.length > 0 && tabs[0].id) {
        return tabs[0];
      }

      // 2. Try currentWindow
      tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs.length > 0 && tabs[0].id) {
        return tabs[0];
      }

      // 3. Fallback: query all active tabs across all windows
      tabs = await chrome.tabs.query({ active: true });
      if (tabs && tabs.length > 0 && tabs[0].id) {
        const valid = tabs.find((t) => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('edge://'));
        return valid || tabs[0];
      }
    } catch (e) {
      console.warn('[CarryON] Error querying active tab:', e);
    }
    return null;
  }, []);

  // Send message to active tab content script with auto-injection fallback
  const sendMessageToActiveTab = useCallback(async (type: string, payload?: any): Promise<any> => {
    try {
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        return null;
      }

      const tab = await getActiveTab();
      if (!tab || !tab.id) {
        return null;
      }

      // If active tab is a restricted browser internal page
      if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://') || tab.url?.startsWith('about:')) {
        return null;
      }

      setActiveTabId(tab.id);

      try {
        return await chrome.tabs.sendMessage(tab.id, { type, payload });
      } catch (err: any) {
        // Content script disconnected or missing (e.g. tab was opened before extension reload)
        // Automatically inject content.js on the fly using scripting API
        if (chrome.scripting && tab.id) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            });
            await new Promise((res) => setTimeout(res, 150));
            return await chrome.tabs.sendMessage(tab.id, { type, payload });
          } catch (scriptErr) {
            console.warn('[CarryON] Auto-injection failed:', scriptErr);
          }
        }
        return null;
      }
    } catch (e) {
      console.warn('Could not send message to active tab:', e);
      return null;
    }
  }, [getActiveTab]);

  // Check backend health
  const checkHealth = useCallback(async () => {
    try {
      const res = await ApiService.checkHealth();
      setBackendStatus('connected');
      setAiStatus(res.ai_engine || 'ready');
    } catch (e) {
      setBackendStatus('disconnected');
      setAiStatus('offline');
    }
  }, []);

  // Scan current page
  const scanPage = useCallback(async () => {
    setIsScanning(true);
    try {
      const res = await sendMessageToActiveTab(MSG_TYPES.SCAN_PAGE);
      if (res && res.fields) {
        setScanResult(res);

        let activeWf: Workflow | null = null;
        const savedWfId = await StorageUtil.get<number>(STORAGE_KEYS.ACTIVE_WORKFLOW_ID);
        if (savedWfId) {
          try {
            activeWf = await ApiService.getWorkflow(savedWfId);
          } catch (_) {
            await StorageUtil.remove(STORAGE_KEYS.ACTIVE_WORKFLOW_ID);
          }
        }

        // If no active workflow from storage, check if one exists on backend for this URL
        if (!activeWf && res.url) {
          try {
            const list = await ApiService.listWorkflows(10);
            const found = list.find((w) => w.website_url === res.url);
            if (found) {
              activeWf = found;
              await StorageUtil.set(STORAGE_KEYS.ACTIVE_WORKFLOW_ID, found.id);
            }
          } catch (_) {}
        }

        // Otherwise create new workflow
        if (!activeWf && res.url) {
          try {
            activeWf = await ApiService.createWorkflow({
              title: res.title || 'Job Application Workflow',
              website_url: res.url,
              status: 'in_progress',
              current_step: res.currentStep || 1,
              total_steps: res.totalSteps || 5,
              steps: [
                { step_index: 1, title: 'Personal Information', status: res.currentStep >= 1 ? 'in_progress' : 'pending' },
                { step_index: 2, title: 'Education', status: res.currentStep >= 2 ? 'in_progress' : 'pending' },
                { step_index: 3, title: 'Experience', status: res.currentStep >= 3 ? 'in_progress' : 'pending' },
                { step_index: 4, title: 'Skills and Resume', status: res.currentStep >= 4 ? 'in_progress' : 'pending' },
                { step_index: 5, title: 'Review and Submit', status: res.currentStep >= 5 ? 'in_progress' : 'pending' }
              ]
            });
            await StorageUtil.set(STORAGE_KEYS.ACTIVE_WORKFLOW_ID, activeWf.id);
          } catch (e) {
            console.warn('Could not auto-create workflow on backend:', e);
          }
        }

        if (activeWf) {
          setWorkflow(activeWf);
        }
      }
    } catch (e) {
      console.warn('Scan failed:', e);
    } finally {
      setIsScanning(false);
    }
  }, [sendMessageToActiveTab]);

  // Execute DOM Action
  const executeAction = useCallback(async (action: any) => {
    return await sendMessageToActiveTab(MSG_TYPES.EXECUTE_ACTION, action);
  }, [sendMessageToActiveTab]);

  // Highlight a specific field
  const highlightField = useCallback(async (fieldId: string, message: string, severity = 'error') => {
    return await executeAction({
      action: 'highlight_field',
      field_id: fieldId,
      message,
      severity
    });
  }, [executeAction]);

  // Focus and scroll to field
  const scrollToField = useCallback(async (fieldId: string) => {
    return await executeAction({
      action: 'scroll_to_field',
      field_id: fieldId
    });
  }, [executeAction]);

  // Clear all highlights
  const clearAllHighlights = useCallback(async () => {
    return await sendMessageToActiveTab(MSG_TYPES.CLEAR_ALL_HIGHLIGHTS);
  }, [sendMessageToActiveTab]);

  // Save current step checkpoint with auto-workflow initialization and robust feedback
  const saveCheckpoint = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      // 1. Ensure we have scan data
      let currentScan = scanResult;
      if (!currentScan || !currentScan.fields || currentScan.fields.length === 0) {
        currentScan = await sendMessageToActiveTab(MSG_TYPES.SCAN_PAGE);
        if (currentScan && currentScan.fields) {
          setScanResult(currentScan);
        }
      }

      if (!currentScan || !currentScan.fields || currentScan.fields.length === 0) {
        const tab = await getActiveTab();
        if (tab?.url?.startsWith('chrome://') || tab?.url?.startsWith('edge://')) {
          return {
            success: false,
            message: 'Please click on your application tab (http://localhost:8080/application.html) before saving.'
          };
        }
        return {
          success: false,
          message: 'Unable to connect to webpage. Please click on your application tab (http://localhost:8080/application.html) and refresh the page (F5).'
        };
      }

      // 2. Ensure workflow exists
      let activeWf = workflow;
      if (!activeWf?.id) {
        const savedWfId = await StorageUtil.get<number>(STORAGE_KEYS.ACTIVE_WORKFLOW_ID);
        if (savedWfId) {
          try {
            activeWf = await ApiService.getWorkflow(savedWfId);
          } catch (_) {}
        }
      }

      if (!activeWf?.id) {
        activeWf = await ApiService.createWorkflow({
          title: currentScan.title || 'Job Application Workflow',
          website_url: currentScan.url || window.location.href,
          status: 'in_progress',
          current_step: currentScan.currentStep || 1,
          total_steps: currentScan.totalSteps || 5,
          steps: [
            { step_index: 1, title: 'Personal Information', status: 'in_progress' },
            { step_index: 2, title: 'Education', status: 'pending' },
            { step_index: 3, title: 'Experience', status: 'pending' },
            { step_index: 4, title: 'Skills and Resume', status: 'pending' },
            { step_index: 5, title: 'Review and Submit', status: 'pending' }
          ]
        });
        await StorageUtil.set(STORAGE_KEYS.ACTIVE_WORKFLOW_ID, activeWf.id);
      }

      // 3. Collect field values
      const snapshot: Record<string, any> = {};
      (currentScan.fields || []).forEach((f) => {
        const isSensitive = ['password', 'otp', 'token', 'cvv'].some((kw) => f.carryon_id.toLowerCase().includes(kw));
        if (!isSensitive) {
          snapshot[f.carryon_id] = f.current_value || '';
        }
      });

      await ApiService.saveCheckpoint(activeWf.id, currentScan.currentStep || 1, snapshot);
      const updatedWf = await ApiService.getWorkflow(activeWf.id);
      setWorkflow(updatedWf);
      return {
        success: true,
        message: `Checkpoint saved for Step ${currentScan.currentStep || 1} (${Object.keys(snapshot).length} fields captured)!`
      };
    } catch (e: any) {
      console.error('Failed to save checkpoint:', e);
      return { success: false, message: `Save checkpoint error: ${e.message}` };
    }
  }, [workflow, scanResult, sendMessageToActiveTab]);

  // Initial load and listeners
  useEffect(() => {
    checkHealth();
    scanPage();

    // Listen for background messages (like step changed)
    const listener = (msg: any) => {
      if (msg.type === MSG_TYPES.STEP_CHANGED && msg.payload) {
        setScanResult(msg.payload);
      }
    };

    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(listener);
    }

    // Automatically scan when the user switches to a different tab or reloads a tab
    const onTabActivated = () => {
      scanPage();
    };
    const onTabUpdated = (_tabId: number, changeInfo: any) => {
      if (changeInfo.status === 'complete') {
        scanPage();
      }
    };

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.onActivated?.addListener(onTabActivated);
      chrome.tabs.onUpdated?.addListener(onTabUpdated);
    }

    return () => {
      if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(listener);
      }
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.onActivated?.removeListener(onTabActivated);
        chrome.tabs.onUpdated?.removeListener(onTabUpdated);
      }
    };
  }, [checkHealth, scanPage]);

  return {
    scanResult,
    workflow,
    isScanning,
    backendStatus,
    aiStatus,
    scanPage,
    checkHealth,
    executeAction,
    highlightField,
    scrollToField,
    clearAllHighlights,
    saveCheckpoint,
    sendMessageToActiveTab
  };
}
