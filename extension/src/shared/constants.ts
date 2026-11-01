export const DEFAULT_BACKEND_URL = 'http://127.0.0.1:8000';

export const STORAGE_KEYS = {
  BACKEND_URL: 'carryon_backend_url',
  ACTIVE_WORKFLOW_ID: 'carryon_active_workflow_id',
  SAVED_PROFILE: 'carryon_saved_profile',
  AUTO_SCAN_ENABLED: 'carryon_auto_scan_enabled'
};

export const SUPPORTED_ACTIONS = [
  'highlight_field',
  'show_message',
  'focus_field',
  'scroll_to_field',
  'fill_field',
  'clear_highlight',
  'suggest_correction',
  'save_checkpoint',
  'clean_overlays'
] as const;
