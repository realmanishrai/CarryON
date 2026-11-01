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
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'assistant', label: 'Assistant', icon: <MessageSquare className="w-4 h-4" /> },
    {
      id: 'recovery',
      label: 'Recovery',
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: errorCount > 0 ? errorCount : undefined
    },
    { id: 'autofill', label: 'Autofill', icon: <Wand2 className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> }
  ];

  return (
    <nav className="flex items-center justify-between px-2 py-1.5 bg-[#121620] border-b border-[#293244]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all relative ${
              isActive
                ? 'bg-[#191F2B] text-[#8B7CFF] border border-[#8B7CFF]/30 shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#191F2B]/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center -ml-0.5">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
