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
    <header className="flex items-center justify-between px-4 py-3 bg-[#071220] border-b border-[#1A2B42] select-none sticky top-0 z-50">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00D9F5] to-[#078BFF] flex items-center justify-center font-bold text-[#050D19] text-sm shadow-[0_0_12px_rgba(0,217,245,0.3)] shrink-0">
          C
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-[24px] font-bold tracking-tight text-[#F4F8FF] leading-none font-display">
              CarryON
            </h1>
            <span className="text-[13px] text-[#00D9F5] font-extrabold tracking-wider uppercase leading-none">
              AI
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                backendStatus === 'connected' ? 'bg-[#00DB85]' : 'bg-[#EF4444]'
              }`}
            />
            <span className="text-[12px] font-normal text-[#94A3B8] leading-none">
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
          className="p-1.5 rounded-lg hover:bg-[#0B1726] text-[#94A3B8] hover:text-[#F4F8FF] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-[#00D9F5]' : ''}`} />
        </button>

        <button
          onClick={onOpenSettings}
          title="Settings"
          className="p-1.5 rounded-lg hover:bg-[#0B1726] text-[#94A3B8] hover:text-[#F4F8FF] transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
