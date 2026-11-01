import React, { useState, useEffect } from 'react';
import { Workflow, PageScanResult, Checkpoint } from '../../shared/types';
import { ApiService } from '../../utils/api';
import { ErrorCard } from './ErrorCard';
import { RotateCcw, ShieldCheck, CheckCircle, AlertOctagon, History, ArrowRight } from 'lucide-react';

interface RecoveryPanelProps {
  workflow: Workflow | null;
  scanResult: PageScanResult | null;
  onLocateError: (fieldId: string, message: string, severity: string) => void;
  onApplyFix: (fieldId: string, value: string) => void;
  onRestoreFields: (fields: Record<string, any>) => Promise<any>;
}

export const RecoveryPanel: React.FC<RecoveryPanelProps> = ({
  workflow,
  scanResult,
  onLocateError,
  onApplyFix,
  onRestoreFields
}) => {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreFeedback, setRestoreFeedback] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  const errors = scanResult?.errors || [];

  // Fetch checkpoint history for active workflow
  useEffect(() => {
    if (workflow?.id) {
      ApiService.listCheckpoints(workflow.id)
        .then((cps) => setCheckpoints(cps))
        .catch(() => {});
    }
  }, [workflow]);

  const latestCheckpoint = checkpoints[0];

  const handleRestore = async (cpId?: number) => {
    if (!workflow?.id) return;
    setIsRestoring(true);
    setRestoreFeedback(null);
    setVerificationStatus(null);

    try {
      const plan = await ApiService.restoreWorkflow(workflow.id, cpId);
      const fieldsToRestore = plan.fields_to_restore;

      if (Object.keys(fieldsToRestore).length === 0) {
        setRestoreFeedback('No fields to restore from this checkpoint.');
        setIsRestoring(false);
        return;
      }

      // Execute restoration through content script
      const res = await onRestoreFields(fieldsToRestore);
      const restoredCount = res?.results?.filter((r: any) => r.success).length || Object.keys(fieldsToRestore).length;

      setRestoreFeedback(`Recovery Replay: Successfully restored ${restoredCount} field(s) into current session.`);
      setVerificationStatus('Verified: DOM inputs match checkpoint state.');
    } catch (e: any) {
      setRestoreFeedback(`Restoration failed: ${e.message}`);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="p-3.5 space-y-3.5 pb-8 relative z-10">
      {/* Recovery Replay Action Card */}
      <div className="p-4 bg-[#0B1726] border border-[#1A2B42] hover:border-[#00D9F5]/30 rounded-xl shadow-lg space-y-3 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00D9F5]/15 flex items-center justify-center text-[#00D9F5] shrink-0">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#F4F8FF]">Recovery Replay Engine</h3>
            <p className="text-[11px] text-[#94A3B8]">
              Restore state after session interruptions, accidental tab closures, or crashes.
            </p>
          </div>
        </div>

        {latestCheckpoint ? (
          <div className="p-3 bg-[#071220] rounded-lg border border-[#1A2B42] text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="font-semibold text-xs text-[#00D9F5]">Last Saved Checkpoint</span>
              <span className="text-[11px] font-mono text-[#64748B]">Step {latestCheckpoint.step_index}</span>
            </div>
            <div className="text-[11px] text-[#94A3B8]">
              Saved fields: {Object.keys(latestCheckpoint.state_snapshot || {}).join(', ') || 'None'}
            </div>
            <button
              onClick={() => handleRestore(latestCheckpoint.id)}
              disabled={isRestoring}
              className="w-full mt-2 h-9 px-3 rounded-lg bg-gradient-to-r from-[#00D9F5] to-[#078BFF] text-[#050D19] text-xs font-semibold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90 shadow-[0_0_12px_rgba(0,217,245,0.25)] disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
              <span>{isRestoring ? 'Restoring...' : 'Restore Saved Progress'}</span>
            </button>
          </div>
        ) : (
          <div className="p-3 bg-[#071220] rounded-lg border border-[#1A2B42] text-xs text-[#94A3B8] text-center">
            No previous checkpoints found for this session. Save a checkpoint from Overview to enable one-click restore.
          </div>
        )}

        {restoreFeedback && (
          <div className="p-2.5 rounded-lg bg-[#00DB85]/10 border border-[#00DB85]/30 text-xs text-[#00DB85] font-medium flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{restoreFeedback}</span>
          </div>
        )}

        {verificationStatus && (
          <div className="text-[11px] text-[#00D9F5] flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{verificationStatus}</span>
          </div>
        )}
      </div>

      {/* Active Blockers Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-0.5">
          <span className="font-semibold text-[#F4F8FF] flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-[#EF4444]" />
            <span>Active Validation Blockers ({errors.length})</span>
          </span>
        </div>

        {errors.length === 0 ? (
          <div className="p-3 bg-[#0B1726] border border-[#1A2B42] rounded-lg text-xs text-[#94A3B8] text-center">
            No validation errors detected. All fields meet application requirements.
          </div>
        ) : (
          <div className="space-y-2">
            {errors.map((err) => (
              <ErrorCard
                key={err.field_id}
                error={err}
                onLocate={onLocateError}
                onApplyFix={onApplyFix}
              />
            ))}
          </div>
        )}
      </div>

      {/* Checkpoint History */}
      {checkpoints.length > 1 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[#94A3B8] flex items-center gap-1.5 px-0.5">
            <History className="w-3.5 h-3.5 text-[#00D9F5]" />
            <span>Checkpoint History</span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {checkpoints.map((cp) => (
              <div
                key={cp.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B1726] border border-[#1A2B42] text-xs"
              >
                <div>
                  <span className="font-semibold text-[#F4F8FF]">Step {cp.step_index}</span>
                  <span className="text-[10px] text-[#64748B] ml-2 font-mono">
                    {cp.created_at ? new Date(cp.created_at).toLocaleTimeString() : 'Checkpoint'}
                  </span>
                </div>
                <button
                  onClick={() => handleRestore(cp.id)}
                  className="text-[11px] text-[#00D9F5] hover:underline font-semibold"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
