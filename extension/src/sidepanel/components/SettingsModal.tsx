import React, { useState, useEffect } from 'react';
import { StorageUtil } from '../../utils/storage';
import { STORAGE_KEYS, DEFAULT_BACKEND_URL } from '../../shared/constants';
import { ApiService } from '../../utils/api';
import { Check, RefreshCw, X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      StorageUtil.get<string>(STORAGE_KEYS.BACKEND_URL, DEFAULT_BACKEND_URL).then((url) => {
        if (url) setBackendUrl(url);
      });
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      await StorageUtil.set(STORAGE_KEYS.BACKEND_URL, backendUrl);
      const res = await ApiService.checkHealth();
      setTestResult(`Connected! AI Engine: ${res.ai_engine}`);
    } catch (e: any) {
      setTestResult(`Connection failed: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    await StorageUtil.set(STORAGE_KEYS.BACKEND_URL, backendUrl);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#0B1726] border border-[#1A2B42] rounded-xl max-w-sm w-full p-4 space-y-3.5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#F4F8FF] font-display">CarryON Settings</h3>
          <button onClick={onClose} className="p-1 rounded-md text-[#94A3B8] hover:text-[#F4F8FF] hover:bg-[#071220] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[#94A3B8] mb-1 font-medium">Backend API URL</label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              className="w-full bg-[#050D19] border border-[#1A2B42] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F8FF] focus:outline-none focus:border-[#00D9F5] transition-colors font-mono"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex-1 h-8 px-3 rounded-lg bg-[#081524] hover:bg-[#122338] border border-[#1A2B42] text-[#00D9F5] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-2 rounded-lg text-[11px] font-medium ${
                testResult.includes('Connected')
                  ? 'bg-[#00DB85]/10 text-[#00DB85] border border-[#00DB85]/30'
                  : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30'
              }`}
            >
              {testResult}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#1A2B42]">
          <button
            onClick={onClose}
            className="h-8 px-3 rounded-lg text-xs font-semibold text-[#94A3B8] hover:bg-[#071220] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="h-8 px-3.5 rounded-lg bg-gradient-to-r from-[#00D9F5] to-[#078BFF] text-[#050D19] text-xs font-semibold flex items-center gap-1.5 hover:opacity-95 shadow-[0_0_10px_rgba(0,217,245,0.2)] transition-opacity"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
