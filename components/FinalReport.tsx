import React from 'react';
import { CheckCircle, Download, Cpu, HardDrive, Server } from 'lucide-react';
import { ScanResult } from '../types';

interface FinalReportProps {
  result: ScanResult;
}

export const FinalReport: React.FC<FinalReportProps> = ({ result }) => {
  return (
    <div className="glass-panel p-8 rounded-xl border border-emerald-500/30 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-emerald-500/20 p-3 rounded-full">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Scan Complete</h2>
          <p className="text-slate-400">Optimal VPS configuration generated with {result.confidenceScore}% confidence.</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-medium transition">
            <Download className="w-4 h-4" /> Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 text-center">
            <Cpu className="w-8 h-8 text-rose-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{result.recommendedCpu} vCPU</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">Recommended Processing</div>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 text-center">
            <Server className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{result.recommendedRam} GB</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">Recommended RAM</div>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 text-center">
            <HardDrive className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{result.recommendedDisk} GB</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">NVMe Storage</div>
        </div>
      </div>
      
      <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg flex justify-between items-center">
          <span className="text-blue-300 text-sm">Estimated Daily Capacity</span>
          <span className="text-xl font-bold text-white font-mono">{result.maxDailyTraffic.toLocaleString()} Visitors</span>
      </div>
    </div>
  );
};