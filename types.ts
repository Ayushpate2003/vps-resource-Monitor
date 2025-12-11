export interface ScanMetrics {
  cpuCores: number;
  ramGB: number;
  diskGB: number;
  dailyBandwidthGB: number;
  monthlyBandwidthGB: number;
  requestsPerSecond: number;
  estimatedDailyVisitors: number;
}

export type LogType = 'info' | 'metrics' | 'error' | 'success';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: LogType;
}

export interface ChartDataPoint {
  time: string;
  bandwidth: number;
  requests: number;
}

export interface ScanResult {
  recommendedCpu: number;
  recommendedRam: number;
  recommendedDisk: number;
  maxDailyTraffic: number;
  confidenceScore: number;
}

export type ScanStatus = 'idle' | 'connecting' | 'scanning' | 'completed' | 'failed';

export interface ScanState {
  status: ScanStatus;
  progress: number;
  currentStep: string;
  metrics: ScanMetrics;
  logs: LogEntry[];
  chartData: ChartDataPoint[];
  result: ScanResult | null;
  scanId: string | null;
}

export type ViewType = 'scanner' | 'chat' | 'image' | 'video' | 'live';
