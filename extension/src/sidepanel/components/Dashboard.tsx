import React, { useState } from 'react';
import { Workflow, PageScanResult, DetectedError } from '../../shared/types';
import { ProgressTracker } from './ProgressTracker';
import { ErrorCard } from './ErrorCard';
import { RobotMascot } from './RobotMascot';
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
    <div className="p-3.5 space-y-3.5 pb-8 relative z-10">
      {/* Compact Active Workflow Hero Card */}
      <div className="p-4 bg-[#0B1726] border border-[#1A2B42] hover:border-[#00D9F5]/30 rounded-xl shadow-lg space-y-3 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00D9F5]">
                Active Workflow
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wide ${
                  errors.length > 0
                    ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                    : 'bg-[#00DB85]/15 text-[#00DB85] border border-[#00DB85]/30'
                }`}
              >
                {errors.length > 0 ? 'Blocked' : 'In Progress'}
              </span>
            </div>
            <h2 className="text-base font-bold text-[#F4F8FF] leading-snug font-display mt-0.5 truncate">
              {workflow?.title || scanResult?.title || 'Application Process'}
            </h2>
            {scanResult?.url && (
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mt-1 truncate">
                <Globe className="w-3.5 h-3.5 shrink-0 text-[#64748B]" />
                <span className="truncate">{new URL(scanResult.url).hostname}</span>
              </div>
            )}
          </div>

          {/* Robot Mascot positioned on the right */}
          <div className="shrink-0 pt-0.5">
            <RobotMascot className="w-14 h-14" />
          </div>
        </div>

        {/* Thin Glowing Cyan Progress Section */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-xs text-[#94A3B8]">
            <span className="font-medium">Completion Progress</span>
            <span className="font-bold text-[#F4F8FF] font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#071220] rounded-sm border border-[#1A2B42] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00D9F5] to-[#078BFF] rounded-sm shadow-[0_0_8px_rgba(0,217,245,0.6)] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Clean & Professional Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 h-9 flex items-center justify-center gap-1.5 px-3 rounded-lg bg-[#0B1726] hover:bg-[#122338] border border-[#1A2B42] text-xs font-semibold text-[#F4F8FF] transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 text-[#00D9F5] animate-spin shrink-0" />
            ) : (
              <Bookmark className="w-3.5 h-3.5 text-[#00D9F5] shrink-0" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save Checkpoint'}</span>
          </button>

          <button
            onClick={() => onNavigateToTab('autofill')}
            className="flex-1 h-9 flex items-center justify-center gap-1.5 px-3 rounded-lg bg-gradient-to-r from-[#00D9F5] to-[#078BFF] hover:opacity-95 text-xs font-semibold text-[#050D19] shadow-[0_0_12px_rgba(0,217,245,0.25)] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#050D19] shrink-0" />
            <span>Smart Autofill</span>
          </button>
        </div>

        {saveStatus && (
          <div
            className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 animate-fadeIn ${
              saveStatus.success
                ? 'bg-[#00DB85]/10 border border-[#00DB85]/30 text-[#00DB85]'
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
          <div className="flex items-center justify-between text-xs px-0.5">
            <span className="font-semibold text-[#EF4444] flex items-center gap-1.5">
              <span>{errors.length} Issue(s) Detected</span>
            </span>
            <button
              onClick={() => onNavigateToTab('recovery')}
              className="text-[#00D9F5] hover:underline text-[11px] font-medium"
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
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F8FF] font-display px-0.5">
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
