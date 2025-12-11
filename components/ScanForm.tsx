import React, { useState } from 'react';
import { Search, Globe, ShieldCheck } from 'lucide-react';

interface ScanFormProps {
  onStartScan: (url: string) => void;
  isLoading: boolean;
}

export const ScanForm: React.FC<ScanFormProps> = ({ onStartScan, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    onStartScan(url);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
        <div className="relative flex items-center bg-surface border border-slate-700 rounded-lg p-2 shadow-2xl">
          <Globe className="text-slate-400 ml-3 mr-3 w-5 h-5" />
          <input
            type="url"
            placeholder="https://example.com"
            className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 focus:outline-none h-10 font-mono text-sm"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`
              flex items-center gap-2 px-6 py-2 rounded-md font-semibold text-sm transition-all duration-200
              ${isLoading 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-cyan-400 text-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.5)]'}
            `}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full"></span>
                Scanning...
              </span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Start Scan
              </>
            )}
          </button>
        </div>
      </form>
      <div className="flex justify-center gap-6 mt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure Connection</span>
        <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Global CDN Check</span>
      </div>
    </div>
  );
};