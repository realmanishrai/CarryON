import React, { useState } from 'react';
import { Workflow, PageScanResult, DetectedError } from '../../shared/types';
import { ProgressTracker } from './ProgressTracker';
import { ErrorCard } from './ErrorCard';
import { Bookmark, CheckCircle, ExternalLink, Globe, Play, Sparkles, RefreshCw, Check } from 'lucide-react';

interface DashboardProps {
  workflow: Workflow | null;
  scanResult: PageScanResult | null;
  isScanning: boolean;
  onScan: () => void;
  onSaveCheckpoint: () => Promise<any>;
  onLocateError: (fieldId: string, message: string, severity: string) => void;
  onApplyFix: (fieldId: string, value: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  workflow,
  scanResult,
  isScanning,
  onScan,
  onSaveCheckpoint,
  onLocateError,
  onApplyFix,
  onNavigateToTab
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

  const currentStep = scanResult?.currentStep || workflow?.current_step || 1;
  const totalSteps = scanResult?.totalSteps || workflow?.total_steps || 5;
  const progressPercent = Math.min(100, Math.round(((currentStep - 1) / totalSteps) * 100));
  const errors = scanResult?.errors || [];

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res = await onSaveCheckpoint();
      if (res) {
        setSaveStatus(res);
        setTimeout(() => setSaveStatus(null), 4000);
      }
    } catch (e: any) {
      setSaveStatus({ success: false, message: e.message || 'Failed to save checkpoint' });
      setTimeout(() => setSaveStatus(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="p-4 space-y-4">
      {/* Workflow Card */}
      <div className="p-3.5 bg-[#121620] border border-[#293244] rounded-xl space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8B7CFF]">
              Active Workflow
            </span>
            <h2 className="text-sm font-bold text-[#F3F4F6] mt-0.5">
              {workflow?.title || scanResult?.title || 'Application Process'}
            </h2>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
              errors.length > 0
                ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                : 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30'
            }`}
          >
            {errors.length > 0 ? 'Blocked' : 'In Progress'}
          </span>
        </div>

        {scanResult?.url && (
          <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF] truncate">
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{new URL(scanResult.url).hostname}</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[#9CA3AF]">
            <span>Completion Progress</span>
            <span className="font-mono text-[#F3F4F6] font-semibold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-[#191F2B] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B7CFF] to-[#36CFC9] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#191F2B] hover:bg-[#293244] border border-[#293244] text-xs font-medium text-[#F3F4F6] transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 text-[#36CFC9] animate-spin" />
            ) : (
              <Bookmark className="w-3.5 h-3.5 text-[#36CFC9]" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save Checkpoint'}</span>
          </button>

          <button
            onClick={() => onNavigateToTab('autofill')}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#8B7CFF]/20 hover:bg-[#8B7CFF]/30 border border-[#8B7CFF]/30 text-xs font-medium text-[#8B7CFF] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Autofill</span>
          </button>
        </div>

        {saveStatus && (
          <div
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 animate-fadeIn ${
              saveStatus.success
                ? 'bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]'
                : 'bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444]'
            }`}
          >
            {saveStatus.success ? (
              <Check className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Bookmark className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{saveStatus.message}</span>
          </div>
        )}
      </div>

      {/* Detected Issues Banner */}
      {errors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#EF4444] flex items-center gap-1.5">
              <span>{errors.length} Issue(s) Detected</span>
            </span>
            <button
              onClick={() => onNavigateToTab('recovery')}
              className="text-[#8B7CFF] hover:underline text-[11px]"
            >
              View in Recovery &rarr;
            </button>
          </div>

          <div className="space-y-2">
            {errors.slice(0, 2).map((err) => (
              <ErrorCard
                key={err.field_id}
                error={err}
                onLocate={onLocateError}
                onApplyFix={onApplyFix}
              />
            ))}
          </div>
        </div>
      )}

      {/* Steps Progression Tracker */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
          Application Roadmap
        </h3>
        <ProgressTracker
          currentStep={currentStep}
          totalSteps={totalSteps}
          steps={workflow?.steps}
        />
      </div>
    </div>
  );
};
