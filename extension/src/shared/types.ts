export interface DOMFieldMetadata {
  carryon_id: string;
  tag_name: string;
  input_type?: string;
  label?: string;
  name?: string;
  id?: string;
  placeholder?: string;
  required: boolean;
  value_present: boolean;
  current_value?: string;
  validity_state?: Record<string, boolean>;
  error_message?: string;
  section?: string;
  disabled: boolean;
  readonly: boolean;
}

export interface DetectedError {
  field_id: string;
  field_label: string;
  error_type: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  action?: string;
  suggested_correction?: string;
}

export type ActionType =
  | 'highlight_field'
  | 'show_message'
  | 'focus_field'
  | 'scroll_to_field'
  | 'fill_field'
  | 'clear_highlight'
  | 'suggest_correction'
  | 'save_checkpoint'
  | 'clean_overlays';

export interface ActionRecommendation {
  action: ActionType;
  field_id?: string;
  message?: string;
  suggested_value?: string;
  severity?: 'info' | 'warning' | 'error';
  requires_approval: boolean;
}

export interface UserProfile {
  id?: number;
  full_name?: string;
  email?: string;
  phone?: string;
  college?: string;
  degree?: string;
  graduation_year?: number;
  skills: string[];
}

export interface WorkflowStep {
  id?: number;
  step_index: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  error_message?: string;
  recovery_action?: string;
}

export interface Workflow {
  id?: number;
  title: string;
  website_url: string;
  status: 'not_started' | 'in_progress' | 'blocked' | 'completed' | 'interrupted';
  current_step: number;
  total_steps: number;
  steps: WorkflowStep[];
  checkpoints?: Checkpoint[];
  created_at?: string;
  updated_at?: string;
}

export interface Checkpoint {
  id?: number;
  workflow_id: number;
  step_index: number;
  state_snapshot: Record<string, any>;
  created_at?: string;
}

export interface FieldMatch {
  field_id: string;
  field_label: string;
  profile_key: string;
  suggested_value: string;
  confidence: number;
  match_type: 'exact' | 'semantic' | 'heuristic';
  approved?: boolean;
}

export interface PageScanResult {
  url: string;
  title: string;
  fields: DOMFieldMetadata[];
  errors: DetectedError[];
  currentStep: number;
  totalSteps: number;
  timestamp: number;
}
