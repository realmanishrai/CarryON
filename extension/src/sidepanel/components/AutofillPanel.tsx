import React, { useState, useEffect } from 'react';
import { PageScanResult, FieldMatch, UserProfile } from '../../shared/types';
import { ApiService } from '../../utils/api';
import { Check, CheckSquare, Sparkles, Square, Wand2 } from 'lucide-react';

interface AutofillPanelProps {
  scanResult: PageScanResult | null;
  onAutofillFields: (fields: Array<{ field_id: string; value: string }>) => Promise<any>;
}

export const AutofillPanel: React.FC<AutofillPanelProps> = ({ scanResult, onAutofillFields }) => {
  const [matches, setMatches] = useState<FieldMatch[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  // Scan and match fields whenever tab opens or scanResult changes
  useEffect(() => {
    if (!scanResult?.fields || scanResult.fields.length === 0) return;

    setIsLoading(true);
    setResultMessage(null);

    ApiService.matchProfile(scanResult.fields)
      .then((res) => {
        setMatches(res.matches);
        // Default to selecting all matched fields
        const allMatched = new Set(res.matches.map((m) => m.field_id));
        setSelectedIds(allMatched);
      })
      .catch((err) => {
        console.warn('Profile matching error:', err);
      })
      .finally(() => setIsLoading(false));
  }, [scanResult]);

  const toggleSelect = (fieldId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) {
        next.delete(fieldId);
      } else {
        next.add(fieldId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === matches.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(matches.map((m) => m.field_id)));
    }
  };

  const handleApplyAutofill = async () => {
    const approved = matches.filter((m) => selectedIds.has(m.field_id));
    if (approved.length === 0) return;

    setIsLoading(true);
    setResultMessage(null);

    try {
      const payload = approved.map((m) => ({
        field_id: m.field_id,
        value: m.suggested_value
      }));

      const res = await onAutofillFields(payload);
      const successful = res?.results?.filter((r: any) => r.success).length || approved.length;

      setResultMessage(`Successfully autofilled ${successful} field(s) directly into the application.`);
    } catch (e: any) {
      setResultMessage(`Autofill error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-[#F3F4F6] uppercase tracking-wider">
            Smart Application Autofill
          </h2>
          <p className="text-[11px] text-[#9CA3AF]">
            Review matching credentials. Values are filled only after your explicit approval.
          </p>
        </div>
        <div className="w-7 h-7 rounded-lg bg-[#36CFC9]/20 flex items-center justify-center text-[#36CFC9]">
          <Wand2 className="w-4 h-4" />
        </div>
      </div>

      {isLoading && (
        <div className="p-4 text-center text-xs text-[#9CA3AF] bg-[#121620] rounded-xl border border-[#293244]">
          <Sparkles className="w-4 h-4 text-[#8B7CFF] animate-spin mx-auto mb-2" />
          <span>Matching page fields to saved profile...</span>
        </div>
      )}

      {!isLoading && matches.length === 0 && (
        <div className="p-4 text-center text-xs text-[#9CA3AF] bg-[#121620] rounded-xl border border-[#293244] space-y-2">
          <p>No matching profile fields found for this step.</p>
          <p className="text-[11px] text-[#64748B]">
            Make sure you have saved your profile credentials under the "Profile" tab.
          </p>
        </div>
      )}

      {!isLoading && matches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[#9CA3AF]">
              {selectedIds.size} of {matches.length} selected
            </span>
            <button
              onClick={toggleSelectAll}
              className="text-[#8B7CFF] hover:underline text-[11px] font-medium"
            >
              {selectedIds.size === matches.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {matches.map((m) => {
              const isSelected = selectedIds.has(m.field_id);
              return (
                <div
                  key={m.field_id}
                  onClick={() => toggleSelect(m.field_id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#191F2B] border-[#8B7CFF]/50'
                      : 'bg-[#121620] border-[#293244] opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <button type="button" className="text-[#8B7CFF] shrink-0 mt-0.5">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-[#64748B]" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-[#F3F4F6] truncate">
                          {m.field_label}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#36CFC9]/20 text-[#36CFC9] font-mono shrink-0">
                          {Math.round(m.confidence * 100)}% match
                        </span>
                      </div>
                      <div className="text-[11px] text-[#9CA3AF] mt-0.5 truncate">
                        &rarr; <span className="text-[#E2E8F0] font-mono">{m.suggested_value}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {resultMessage && (
            <div className="p-2.5 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[#22C55E] flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{resultMessage}</span>
            </div>
          )}

          <button
            onClick={handleApplyAutofill}
            disabled={selectedIds.size === 0 || isLoading}
            className="w-full py-2 px-3 rounded-lg bg-[#8B7CFF] hover:bg-[#7A6AE6] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Approve &amp; Autofill Selected ({selectedIds.size})</span>
          </button>
        </div>
      )}
    </div>
  );
};
