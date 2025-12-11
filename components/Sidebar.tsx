import React from 'react';
import { LayoutDashboard, MessageSquare, Image, Video, Mic } from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const NavItem: React.FC<{ 
  view: ViewType; 
  current: ViewType; 
  icon: React.ElementType; 
  label: string; 
  onClick: (v: ViewType) => void 
}> = ({ view, current, icon: Icon, label, onClick }) => (
  <button
    onClick={() => onClick(view)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-2
      ${current === view 
        ? 'bg-primary/20 text-primary border border-primary/30' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4">
      <div className="mb-8 px-2 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="font-bold text-white text-lg">G</span>
        </div>
        <h1 className="font-bold text-white tracking-tight">GenAI Suite</h1>
      </div>

      <nav className="flex-1">
        <NavItem view="scanner" current={currentView} icon={LayoutDashboard} label="VPS Scanner" onClick={onNavigate} />
        <NavItem view="chat" current={currentView} icon={MessageSquare} label="AI Assistant" onClick={onNavigate} />
        <NavItem view="image" current={currentView} icon={Image} label="Image Studio" onClick={onNavigate} />
        <NavItem view="video" current={currentView} icon={Video} label="Video Studio" onClick={onNavigate} />
        <NavItem view="live" current={currentView} icon={Mic} label="Live Voice" onClick={onNavigate} />
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Powered by Gemini 2.5 & 3.0
      </div>
    </div>
  );
};