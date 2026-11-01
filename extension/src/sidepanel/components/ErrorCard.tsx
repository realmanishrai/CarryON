import React from 'react';
import { AlertCircle, AlertTriangle, Eye, Sparkles } from 'lucide-react';
import { DetectedError } from '../../shared/types';

interface ErrorCardProps {
  error: DetectedError;
  onLocate: (fieldId: string, message: string, severity: string) => void;
  onApplyFix?: (fieldId: string, value: string) => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ error, onLocate, onApplyFix }) => {
  const isError = error.severity === 'error';

  return (
    <div
      className={`p-3 rounded-lg border text-xs transition-all ${
        isError
          ? 'bg-[#EF4444]/10 border-[#EF4444]/30'
          : 'bg-[#FFD500]/10 border-[#FFD500]/30'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {isError ? (
            <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#FFD500] shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-semibold text-[#F4F8FF] flex items-center gap-1.5">
              <span>{error.field_label}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold tracking-wide ${
                  isError ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#FFD500]/20 text-[#FFD500]'
                }`}
              >
                {error.severity}
              </span>
            </div>
            <p className="text-[#94A3B8] mt-1 leading-snug">{error.message}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-[#1A2B42]/60">
        <button
          onClick={() => onLocate(error.field_id, error.message, error.severity)}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0B1726] hover:bg-[#122338] border border-[#1A2B42] text-[#00D9F5] font-semibold text-[11px] transition-colors"
        >
          <Eye className="w-3 h-3" />
          <span>Locate in Page</span>
        </button>

        {error.suggested_correction && onApplyFix && (
          <button
            onClick={() => onApplyFix(error.field_id, error.suggested_correction!)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#00D9F5]/15 hover:bg-[#00D9F5]/25 text-[#00D9F5] border border-[#00D9F5]/40 font-semibold text-[11px] transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span>Apply Fix: "{error.suggested_correction}"</span>
          </button>
        )}
      </div>
    </div>
  );
};
