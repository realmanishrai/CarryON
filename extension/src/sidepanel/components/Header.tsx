import React from 'react';
import { RefreshCw, Settings, ShieldCheck, Zap } from 'lucide-react';

interface HeaderProps {
  backendStatus: 'checking' | 'connected' | 'disconnected';
  aiStatus: string;
  isScanning: boolean;
  onScan: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  backendStatus,
  aiStatus,
  isScanning,
  onScan,
  onOpenSettings
}) => {
  const isAiActive = aiStatus === 'ready';

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#121620] border-b border-[#293244] sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#8B7CFF] to-[#36CFC9] flex items-center justify-center font-bold text-white text-xs shadow-md shadow-[#8B7CFF]/20">
          C
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-bold tracking-tight text-[#F3F4F6]">CarryON</h1>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/30 rounded font-semibold uppercase">
              AI
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                backendStatus === 'connected' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
              }`}
            />
            <span className="text-[10px] text-[#9CA3AF]">
              {backendStatus === 'connected'
                ? isAiActive
                  ? 'AI Online'
                  : 'Deterministic Engine'
                : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onScan}
          disabled={isScanning}
          title="Rescan current page"
          className="p-1.5 rounded-md hover:bg-[#191F2B] text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-[#8B7CFF]' : ''}`} />
        </button>

        <button
          onClick={onOpenSettings}
          title="Settings"
          className="p-1.5 rounded-md hover:bg-[#191F2B] text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
