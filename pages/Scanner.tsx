import React, { useState, useCallback } from 'react';
import { ScanForm } from '../components/ScanForm';
import { ProgressPanel } from '../components/ProgressPanel';
import { MetricsCards } from '../components/MetricsCards';
import { RealTimeChart } from '../components/RealTimeChart';
import { LiveLogs } from '../components/LiveLogs';
import { FinalReport } from '../components/FinalReport';
import { useSocket } from '../hooks/useSocket';
import { ScanState, ScanMetrics, LogEntry, ChartDataPoint, ScanResult } from '../types';

const INITIAL_STATE: ScanState = {
  status: 'idle',
  progress: 0,
  currentStep: 'Waiting to start...',
  metrics: {
    cpuCores: 0,
    ramGB: 0,
    diskGB: 0,
    dailyBandwidthGB: 0,
    monthlyBandwidthGB: 0,
    requestsPerSecond: 0,
    estimatedDailyVisitors: 0,
  },
  logs: [],
  chartData: [],
  result: null,
  scanId: null,
};

export const Scanner: React.FC = () => {
  const [state, setState] = useState<ScanState>(INITIAL_STATE);

  // Callbacks for the socket hook
  const handleProgress = useCallback((progress: number, step: string) => {
    setState(prev => ({ ...prev, progress, currentStep: step }));
  }, []);

  const handleMetrics = useCallback((metrics: ScanMetrics) => {
    setState(prev => ({ ...prev, metrics }));
  }, []);

  const handleLog = useCallback((log: LogEntry) => {
    setState(prev => ({ ...prev, logs: [...prev.logs, log] }));
  }, []);

  const handleChartData = useCallback((data: ChartDataPoint) => {
    setState(prev => ({ ...prev, chartData: [...prev.chartData, data] }));
  }, []);

  const handleDone = useCallback((result: ScanResult) => {
    setState(prev => ({ ...prev, status: 'completed', result }));
  }, []);

  const handleError = useCallback((error: string) => {
     // Handle error UI here if needed
     console.error(error);
  }, []);

  const { connect } = useSocket({
    onProgress: handleProgress,
    onMetrics: handleMetrics,
    onLog: handleLog,
    onChartData: handleChartData,
    onDone: handleDone,
    onError: handleError
  });

  const startScan = async (url: string) => {
    // 1. Reset State
    setState({
        ...INITIAL_STATE,
        status: 'connecting',
        currentStep: 'Establishing connection...',
    });

    // 2. Mock API Call to get Scan ID (In real app: axios.post('/scan', { url }))
    // const response = await axios.post('/scan', { url });
    // const scanId = response.data.id;
    const mockScanId = "scan_" + Date.now();

    // 3. Connect Socket
    setTimeout(() => {
        setState(prev => ({ ...prev, status: 'scanning', scanId: mockScanId }));
        // Pass the URL to the socket connection for simulation logic
        connect(mockScanId, url);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-white p-6 md:p-12 font-sans selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary mb-3">
            VPS Resource Scanner
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Analyze website traffic and resource consumption in real-time to generate the perfect infrastructure configuration.
          </p>
        </div>

        {/* Input Form */}
        <ScanForm onStartScan={startScan} isLoading={state.status === 'scanning' || state.status === 'connecting'} />

        {/* Dashboard Content */}
        {state.status !== 'idle' && (
          <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            
            <ProgressPanel progress={state.progress} currentStep={state.currentStep} />
            
            <MetricsCards metrics={state.metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RealTimeChart data={state.chartData} />
              </div>
              <div className="lg:col-span-1">
                <LiveLogs logs={state.logs} />
              </div>
            </div>

            {state.status === 'completed' && state.result && (
              <FinalReport result={state.result} />
            )}

          </div>
        )}
      </div>
    </div>
  );
};