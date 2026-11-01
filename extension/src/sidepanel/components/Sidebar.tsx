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
    <nav className="nav-container flex items-center justify-between w-full px-1.5 py-1.5 bg-[#081524] border-b border-[#1A2B42] gap-1 sticky top-[53px] z-40">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            title={tab.label}
            aria-label={tab.label}
            className={`flex-1 min-w-0 flex items-center justify-center gap-1 px-1 py-1.5 rounded-lg transition-all relative ${
              isActive
                ? 'bg-[#0B1726] text-[#00D9F5] border border-[#00D9F5]/40 shadow-[0_0_10px_rgba(0,217,245,0.18)]'
                : 'bg-transparent border border-transparent text-[#94A3B8] hover:text-[#F4F8FF] hover:bg-[#0B1726]/40'
            }`}
          >
            <span className="shrink-0">{tab.icon}</span>
            <span className="nav-tab-label truncate font-semibold">{tab.label}</span>
            {tab.badge && (
              <span className="text-[10px] font-bold text-[#EF4444] shrink-0 leading-none">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
