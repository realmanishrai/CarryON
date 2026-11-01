import { DEFAULT_BACKEND_URL, STORAGE_KEYS } from '../shared/constants';
import { StorageUtil } from './storage';
import {
  UserProfile,
  Workflow,
  Checkpoint,
  DOMFieldMetadata,
  ActionRecommendation,
  FieldMatch
} from '../shared/types';

export class ApiService {
  private static async getBaseUrl(): Promise<string> {
    const custom = await StorageUtil.get<string>(STORAGE_KEYS.BACKEND_URL);
    return custom || DEFAULT_BACKEND_URL;
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = await this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    try {
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        let errDetail = res.statusText;
        try {
          const errData = await res.json();
          errDetail = errData.detail || JSON.stringify(errData);
        } catch (_) {}
        throw new Error(`API error (${res.status}): ${errDetail}`);
      }
      return await res.json();
    } catch (e: any) {
      console.warn(`API request failed: ${endpoint}`, e.message);
      throw e;
    }
  }

  // Health
  static async checkHealth(): Promise<{ status: string; database: string; ai_engine: string }> {
    return this.request('/health');
  }

  // Profile
  static async getProfile(): Promise<UserProfile | null> {
    return this.request<UserProfile | null>('/profile');
  }

  static async saveProfile(profile: UserProfile): Promise<UserProfile> {
    return this.request<UserProfile>('/profile', {
      method: 'POST',
      body: JSON.stringify(profile)
    });
  }

  static async deleteProfile(): Promise<void> {
    return this.request('/profile', { method: 'DELETE' });
  }

  // Workflows
  static async createWorkflow(wf: Partial<Workflow>): Promise<Workflow> {
    return this.request<Workflow>('/workflow/create', {
      method: 'POST',
      body: JSON.stringify(wf)
    });
  }

  static async getWorkflow(id: number): Promise<Workflow> {
    return this.request<Workflow>(`/workflow/${id}`);
  }

  static async listWorkflows(): Promise<Workflow[]> {
    return this.request<Workflow[]>('/workflow');
  }

  static async updateWorkflow(id: number, update: Partial<Workflow>): Promise<Workflow> {
    return this.request<Workflow>(`/workflow/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update)
    });
  }

  static async deleteWorkflow(id: number): Promise<void> {
    return this.request(`/workflow/${id}`, { method: 'DELETE' });
  }

  // Checkpoints
  static async saveCheckpoint(workflowId: number, stepIndex: number, snapshot: Record<string, any>): Promise<Checkpoint> {
    return this.request<Checkpoint>(`/workflow/${workflowId}/checkpoint`, {
      method: 'POST',
      body: JSON.stringify({
        workflow_id: workflowId,
        step_index: stepIndex,
        state_snapshot: snapshot
      })
    });
  }

  static async listCheckpoints(workflowId: number): Promise<Checkpoint[]> {
    return this.request<Checkpoint[]>(`/workflow/${workflowId}/checkpoints`);
  }

  static async restoreWorkflow(workflowId: number, checkpointId?: number, approvedFieldIds?: string[]): Promise<{
    workflow_id: number;
    checkpoint_id: number;
    step_index: number;
    fields_to_restore: Record<string, any>;
    fields_skipped: string[];
    summary: string;
  }> {
    return this.request(`/workflow/${workflowId}/restore`, {
      method: 'POST',
      body: JSON.stringify({
        checkpoint_id: checkpointId,
        approved_field_ids: approvedFieldIds
      })
    });
  }

  // Analysis & AI
  static async chat(data: {
    message: string;
    history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    page_url?: string;
    page_title?: string;
    current_step?: number;
    fields?: DOMFieldMetadata[];
    detected_errors?: any[];
  }): Promise<{
    reply: string;
    field_id?: string;
    field_label?: string;
    action?: ActionRecommendation;
  }> {
    return this.request('/analyze/chat', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async analyzePage(data: {
    website_url: string;
    page_title?: string;
    current_step?: number;
    total_steps?: number;
    fields: DOMFieldMetadata[];
    detected_errors?: any[];
  }): Promise<{
    page_status: string;
    current_step_inferred: number;
    summary: string;
    issues: any[];
    recommended_actions: ActionRecommendation[];
    confidence: number;
  }> {
    return this.request('/analyze', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async explainField(fieldMetadata: DOMFieldMetadata, question?: string): Promise<{
    field_id: string;
    field_label: string;
    explanation: string;
    examples: string[];
    recommended_action?: ActionRecommendation;
  }> {
    return this.request('/analyze/explain-field', {
      method: 'POST',
      body: JSON.stringify({
        field_metadata: fieldMetadata,
        user_question: question
      })
    });
  }

  static async matchProfile(fields: DOMFieldMetadata[], profile?: Record<string, any>): Promise<{
    matches: FieldMatch[];
    unmatched_fields: string[];
  }> {
    return this.request('/analyze/match-profile', {
      method: 'POST',
      body: JSON.stringify({
        fields,
        profile
      })
    });
  }

  // Recovery
  static async diagnoseRecovery(data: {
    website_url: string;
    current_step?: number;
    fields?: DOMFieldMetadata[];
    errors?: any[];
  }): Promise<{
    status: string;
    summary: string;
    blockers: any[];
    actions: ActionRecommendation[];
    can_auto_recover: boolean;
  }> {
    return this.request('/recover', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async verifyRecovery(data: {
    workflow_id?: number;
    field_id: string;
    expected_value?: string;
    actual_value?: string;
    form_validity?: boolean;
  }): Promise<{
    field_id: string;
    is_resolved: boolean;
    message: string;
    current_step_valid: boolean;
  }> {
    return this.request('/recover/verify', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}
