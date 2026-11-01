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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#121620] border border-[#293244] rounded-xl max-w-sm w-full p-4 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#F3F4F6]">CarryON Settings</h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[#9CA3AF] mb-1 font-medium">Backend API URL</label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              className="w-full bg-[#0B0D12] border border-[#293244] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex-1 py-1.5 px-3 rounded-lg bg-[#191F2B] hover:bg-[#293244] border border-[#293244] text-[#8B7CFF] font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-2 rounded text-[11px] font-medium ${
                testResult.includes('Connected')
                  ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30'
                  : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30'
              }`}
            >
              {testResult}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#293244]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs text-[#9CA3AF] hover:bg-[#191F2B]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-lg bg-[#8B7CFF] hover:bg-[#7A6AE6] text-white text-xs font-semibold flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
