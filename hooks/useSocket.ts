import { useEffect, useRef, useState, useCallback } from 'react';
// In a real app, you would import io from 'socket.io-client';
// import { io, Socket } from 'socket.io-client';
import { ScanMetrics, LogEntry, ChartDataPoint, ScanResult, ScanStatus } from '../types';

// DEMO CONSTANTS to simulate backend behavior
const DEMO_MODE = true; 

interface UseSocketProps {
  onProgress: (progress: number, step: string) => void;
  onMetrics: (metrics: ScanMetrics) => void;
  onLog: (log: LogEntry) => void;
  onChartData: (data: ChartDataPoint) => void;
  onDone: (result: ScanResult) => void;
  onError: (error: string) => void;
}

export const useSocket = ({
  onProgress,
  onMetrics,
  onLog,
  onChartData,
  onDone,
  onError,
}: UseSocketProps) => {
  const [socket, setSocket] = useState<any>(null); // Type would be Socket | null
  const simulationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback((scanId: string, url: string = "https://example.com") => {
    if (!DEMO_MODE) {
      // REAL IMPLEMENTATION
      /*
      const newSocket = io('https://api.yourbackend.com', {
        query: { scanId, url },
      });

      newSocket.on('scan:progress', (data) => onProgress(data.percentage, data.step));
      newSocket.on('scan:metrics', (data) => onMetrics(data));
      newSocket.on('scan:log', (data) => onLog(data));
      newSocket.on('scan:chart', (data) => onChartData(data));
      newSocket.on('scan:done', (data) => onDone(data));
      newSocket.on('scan:error', (data) => onError(data.message));

      setSocket(newSocket);
      */
    } else {
      // SIMULATION IMPLEMENTATION FOR DEMO
      console.log(`Connecting to mock socket for scan: ${scanId}, url: ${url}`);
      
      // 1. Determine "Profile" based on URL
      const isHeavy = url.includes('news') || url.includes('app') || url.includes('shop') || url.includes('store') || url.includes('dynamic');
      const isStatic = url.includes('blog') || url.includes('docs') || url.includes('bootstrap') || url.includes('static') || url.includes('css');
      
      // Random baseline variance
      const randomSeed = Math.random();
      
      // Base specs
      let baseCpu = 2;
      let baseRam = 4;
      let baseDisk = 40;
      let baseTraffic = 10000;

      if (isHeavy) {
        baseCpu = 8;
        baseRam = 16;
        baseDisk = 250;
        baseTraffic = 150000;
      } else if (isStatic) {
        baseCpu = 1;
        baseRam = 1; // 1GB usually enough for static
        baseDisk = 10;
        baseTraffic = 5000;
      } else {
        // Random mix for unknown
        baseCpu = randomSeed > 0.5 ? 4 : 2;
        baseRam = randomSeed > 0.5 ? 8 : 4;
      }

      // Add randomness to final result
      const finalCpu = baseCpu;
      const finalRam = baseRam;
      const finalDisk = baseDisk + Math.floor(Math.random() * 20);
      const finalTraffic = baseTraffic + Math.floor(Math.random() * 5000);
      const confidence = 85 + Math.floor(Math.random() * 14);

      let progress = 0;
      
      const interval = setInterval(() => {
        progress += 1;

        // 1. Emit Progress
        let stepName = "Initializing...";
        if (progress > 10) stepName = `Resolving DNS for ${new URL(url).hostname}`;
        if (progress > 30) stepName = isHeavy ? "Analyzing Dynamic Assets (JS/WASM)" : "Crawling Static Assets";
        if (progress > 60) stepName = "Measuring Server Response Time";
        if (progress > 85) stepName = "Calculating Resource Overhead";
        if (progress >= 100) stepName = "Finalizing Report";

        onProgress(Math.min(progress, 100), stepName);

        // 2. Emit Logs (Randomly)
        if (Math.random() > 0.65) {
          const logTypes = ['info', 'metrics', 'info'] as const;
          const messages = [
            `GET ${url}/assets/chunk-${Math.floor(Math.random() * 999)}.js`,
            `Analyzed DOM nodes: ${Math.floor(Math.random() * 5000)}`,
            `Detected latency: ${(Math.random() * 100).toFixed(2)}ms`,
            `Resource size: ${(Math.random() * 5).toFixed(2)} MB`
          ];
          onLog({
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            message: messages[Math.floor(Math.random() * messages.length)],
            type: logTypes[Math.floor(Math.random() * logTypes.length)],
          });
        }

        // 3. Emit Metrics (Ramp up to the final values)
        const currentCpu = parseFloat((Math.min(baseCpu, progress / 20) + Math.random() * 0.5).toFixed(1));
        const currentRam = parseFloat((Math.min(baseRam, progress / 15) + Math.random() * 0.2).toFixed(1));
        const currentRps = Math.floor((baseTraffic / 86400) * 1.5 * (progress/100) * (1 + Math.random()));

        const metrics: ScanMetrics = {
          cpuCores: currentCpu,
          ramGB: currentRam,
          diskGB: Math.floor(baseDisk * (progress/100)),
          dailyBandwidthGB: parseFloat(((baseTraffic * 0.002) * (progress/100)).toFixed(2)),
          monthlyBandwidthGB: parseFloat(((baseTraffic * 0.06) * (progress/100)).toFixed(2)),
          requestsPerSecond: currentRps,
          estimatedDailyVisitors: Math.floor(baseTraffic * (progress/100)),
        };
        onMetrics(metrics);

        // 4. Emit Chart Data
        onChartData({
          time: new Date().toLocaleTimeString(),
          bandwidth: currentRps, 
          requests: currentRps + Math.floor(Math.random() * 10)
        });

        // 5. Completion
        if (progress >= 100) {
          if (simulationInterval.current) clearInterval(simulationInterval.current);
          onDone({
            recommendedCpu: finalCpu,
            recommendedRam: finalRam,
            recommendedDisk: finalDisk,
            maxDailyTraffic: finalTraffic,
            confidenceScore: confidence,
          });
          onLog({
            id: 'done',
            timestamp: new Date().toLocaleTimeString(),
            message: `Scan for ${url} completed successfully.`,
            type: 'success'
          });
        }

      }, 80); // Speed of scan

      simulationInterval.current = interval;
    }
  }, [onProgress, onMetrics, onLog, onChartData, onDone, onError]);

  const disconnect = useCallback(() => {
    if (socket) socket.disconnect();
    if (simulationInterval.current) clearInterval(simulationInterval.current);
  }, [socket]);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return { connect, disconnect };
};