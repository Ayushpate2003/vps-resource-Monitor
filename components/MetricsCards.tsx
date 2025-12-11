import React from 'react';
import { Cpu, HardDrive, Server, Activity, Users, Globe } from 'lucide-react';
import { ScanMetrics } from '../types';

interface MetricsCardsProps {
  metrics: ScanMetrics;
}

const Card: React.FC<{ 
  title: string; 
  value: string | number; 
  unit: string; 
  icon: React.ElementType; 
  color: string 
}> = ({ title, value, unit, icon: Icon, color }) => (
  <div className="glass-panel p-4 rounded-xl flex flex-col justify-between group hover:border-slate-600 transition duration-300">
    <div className="flex justify-between items-start mb-2">
      <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">{title}</span>
      <div className={`p-2 rounded-lg bg-slate-800/50 ${color}`}>
        <Icon size={16} />
      </div>
    </div>
    <div>
      <div className="text-2xl font-bold text-white font-mono tracking-tight group-hover:text-primary transition-colors">
        {value}
        <span className="text-sm text-slate-500 ml-1 font-sans font-normal">{unit}</span>
      </div>
    </div>
  </div>
);

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      <Card 
        title="Est. CPU Load" 
        value={metrics.cpuCores} 
        unit="Cores" 
        icon={Cpu} 
        color="text-rose-400" 
      />
      <Card 
        title="RAM Usage" 
        value={metrics.ramGB} 
        unit="GB" 
        icon={Server} 
        color="text-emerald-400" 
      />
      <Card 
        title="NVMe Disk" 
        value={metrics.diskGB} 
        unit="GB" 
        icon={HardDrive} 
        color="text-amber-400" 
      />
      <Card 
        title="Peak Load" 
        value={metrics.requestsPerSecond} 
        unit="Req/s" 
        icon={Activity} 
        color="text-cyan-400" 
      />
      <Card 
        title="Daily Traffic" 
        value={metrics.dailyBandwidthGB} 
        unit="GB" 
        icon={Globe} 
        color="text-blue-400" 
      />
      <Card 
        title="Capacity" 
        value={metrics.estimatedDailyVisitors.toLocaleString()} 
        unit="Users" 
        icon={Users} 
        color="text-purple-400" 
      />
    </div>
  );
};