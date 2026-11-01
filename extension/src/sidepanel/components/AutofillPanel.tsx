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
    <div className="p-3.5 space-y-3.5 pb-8 relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-[#F4F8FF] uppercase tracking-wider">
            Smart Application Autofill
          </h2>
          <p className="text-[11px] text-[#94A3B8]">
            Review matching credentials. Values are filled only after your explicit approval.
          </p>
        </div>
        <div className="w-7 h-7 rounded-lg bg-[#00D9F5]/15 flex items-center justify-center text-[#00D9F5] shrink-0">
          <Wand2 className="w-4 h-4" />
        </div>
      </div>

      {isLoading && (
        <div className="p-4 text-center text-xs text-[#94A3B8] bg-[#0B1726] rounded-lg border border-[#1A2B42]">
          <Sparkles className="w-4 h-4 text-[#00D9F5] animate-spin mx-auto mb-2" />
          <span>Matching page fields to saved profile...</span>
        </div>
      )}

      {!isLoading && matches.length === 0 && (
        <div className="p-4 text-center text-xs text-[#94A3B8] bg-[#0B1726] rounded-lg border border-[#1A2B42] space-y-1">
          <p className="font-medium text-[#F4F8FF]">No matching profile fields found for this step.</p>
          <p className="text-[11px] text-[#64748B]">
            Make sure you have saved your profile credentials under the "Profile" tab.
          </p>
        </div>
      )}

      {!isLoading && matches.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs px-0.5">
            <span className="text-[#94A3B8] font-medium">
              {selectedIds.size} of {matches.length} selected
            </span>
            <button
              onClick={toggleSelectAll}
              className="text-[#00D9F5] hover:underline font-semibold text-[11px]"
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
                      ? 'bg-[#0B1726] border-[#00D9F5]/60 shadow-[0_0_10px_rgba(0,217,245,0.12)]'
                      : 'bg-[#0B1726]/60 border border-[#1A2B42] opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <button type="button" className="text-[#00D9F5] shrink-0 mt-0.5">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-[#64748B]" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-semibold text-xs text-[#F4F8FF] truncate">
                          {m.field_label}
                        </span>
                        <span className="text-[11px] text-[#00D9F5] font-mono font-medium shrink-0">
                          {Math.round(m.confidence * 100)}% match
                        </span>
                      </div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5 truncate">
                        &rarr; <span className="text-[#F4F8FF] font-mono font-medium">{m.suggested_value}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {resultMessage && (
            <div className="p-2.5 rounded-lg bg-[#00DB85]/10 border border-[#00DB85]/30 text-xs text-[#00DB85] font-medium flex items-center gap-2">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{resultMessage}</span>
            </div>
          )}

          <button
            onClick={handleApplyAutofill}
            disabled={selectedIds.size === 0 || isLoading}
            className="w-full h-9 px-3 rounded-lg bg-gradient-to-r from-[#00D9F5] to-[#078BFF] hover:opacity-95 text-[#050D19] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(0,217,245,0.25)] transition-opacity disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Approve &amp; Autofill Selected ({selectedIds.size})</span>
          </button>
        </div>
      )}
    </div>
  );
};
