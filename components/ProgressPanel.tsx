import React from 'react';

interface ProgressPanelProps {
  progress: number;
  currentStep: string;
}

export const ProgressPanel: React.FC<ProgressPanelProps> = ({ progress, currentStep }) => {
  return (
    <div className="glass-panel p-6 rounded-xl mb-6 border-t-2 border-primary/20 relative overflow-hidden">
      {/* Background Grid Decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none"></div>

      <div className="flex justify-between items-end mb-2 relative z-10">
        <div>
          <h3 className="text-primary font-mono text-sm uppercase tracking-wider mb-1">Status</h3>
          <p className="text-white font-medium text-lg animate-pulse">{currentStep}</p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-bold font-mono text-white">{progress}%</span>
        </div>
      </div>

      <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative z-10">
        <div 
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};