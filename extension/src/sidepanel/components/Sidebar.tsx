import React from 'react';
import { LayoutDashboard, MessageSquare, ShieldAlert, Wand2, User } from 'lucide-react';

export type NavTab = 'overview' | 'assistant' | 'recovery' | 'autofill' | 'profile';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  errorCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, errorCount }) => {
  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
    { id: 'assistant', label: 'Assistant', icon: <MessageSquare className="w-4 h-4 shrink-0" /> },
    {
      id: 'recovery',
      label: 'Recovery',
      icon: <ShieldAlert className="w-4 h-4 shrink-0" />,
      badge: errorCount > 0 ? errorCount : undefined
    },
    { id: 'autofill', label: 'Autofill', icon: <Wand2 className="w-4 h-4 shrink-0" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4 shrink-0" /> }
  ];

  return (
    <nav className="flex items-center justify-between px-2 py-1.5 bg-[#081524] border-b border-[#1A2B42] overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative shrink-0 ${
              isActive
                ? 'bg-[#0B1726] text-[#00D9F5] border border-[#00D9F5]/40 shadow-[0_0_10px_rgba(0,217,245,0.18)]'
                : 'bg-transparent border border-transparent text-[#94A3B8] hover:text-[#F4F8FF] hover:bg-[#0B1726]/40'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="w-4 h-4 rounded bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center -ml-0.5">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
