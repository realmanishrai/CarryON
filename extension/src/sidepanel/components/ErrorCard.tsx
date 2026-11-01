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
          : 'bg-[#F59E0B]/10 border-[#F59E0B]/30'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {isError ? (
            <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-semibold text-[#F3F4F6] flex items-center gap-1.5">
              <span>{error.field_label}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold ${
                  isError ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                }`}
              >
                {error.severity}
              </span>
            </div>
            <p className="text-[#D1D5DB] mt-1 leading-snug">{error.message}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-[#293244]/60">
        <button
          onClick={() => onLocate(error.field_id, error.message, error.severity)}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#191F2B] hover:bg-[#293244] text-[#8B7CFF] font-medium text-[11px] transition-colors"
        >
          <Eye className="w-3 h-3" />
          <span>Locate in Page</span>
        </button>

        {error.suggested_correction && onApplyFix && (
          <button
            onClick={() => onApplyFix(error.field_id, error.suggested_correction!)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#8B7CFF]/20 hover:bg-[#8B7CFF]/30 text-[#8B7CFF] border border-[#8B7CFF]/40 font-medium text-[11px] transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span>Apply Fix: "{error.suggested_correction}"</span>
          </button>
        )}
      </div>
    </div>
  );
};
