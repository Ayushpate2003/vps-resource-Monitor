import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal } from 'lucide-react';

interface LiveLogsProps {
  logs: LogEntry[];
}

export const LiveLogs: React.FC<LiveLogsProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'success': return 'text-emerald-400';
      case 'metrics': return 'text-cyan-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="glass-panel rounded-xl h-80 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-slate-700 bg-slate-800/50 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-mono text-slate-300">SYSTEM LOGS</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 scrollbar-hide">
        {logs.length === 0 && (
            <div className="text-slate-600 italic">Waiting for connection...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3">
            <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
            <span className={`${getLogColor(log.type)} break-all`}>
              {log.type === 'metrics' && '>> '}
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};