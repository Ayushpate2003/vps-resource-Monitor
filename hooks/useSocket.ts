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

  const connect = useCallback((scanId: string) => {
    if (!DEMO_MODE) {
      // REAL IMPLEMENTATION
      /*
      const newSocket = io('https://api.yourbackend.com', {
        query: { scanId },
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
      console.log(`Connecting to mock socket for scan: ${scanId}`);
      let progress = 0;
      let timeStep = 0;
      
      const interval = setInterval(() => {
        progress += 1;
        timeStep += 1;

        // 1. Emit Progress
        let stepName = "Initializing...";
        if (progress > 10) stepName = "Resolving DNS & Headers";
        if (progress > 30) stepName = "Crawling Assets & Media";
        if (progress > 60) stepName = "Analyzing Server Response Time";
        if (progress > 85) stepName = "Calculating Resource Overhead";
        if (progress >= 100) stepName = "Finalizing Report";

        onProgress(Math.min(progress, 100), stepName);

        // 2. Emit Logs (Randomly)
        if (Math.random() > 0.6) {
          const logTypes = ['info', 'metrics', 'info', 'info'] as const;
          const messages = [
            `Fetched chunk ${Math.floor(Math.random() * 1000)} from CDN`,
            `Analyzed packet header size: ${Math.floor(Math.random() * 500)} bytes`,
            `Detected script execution time: ${Math.random().toFixed(2)}ms`,
            `Resource load: image_asset_${Math.floor(Math.random() * 50)}.jpg`
          ];
          onLog({
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            message: messages[Math.floor(Math.random() * messages.length)],
            type: logTypes[Math.floor(Math.random() * logTypes.length)],
          });
        }

        // 3. Emit Metrics (with some noise)
        const metrics: ScanMetrics = {
          cpuCores: parseFloat((1 + (progress / 20)).toFixed(1)),
          ramGB: parseFloat((0.5 + (progress / 10)).toFixed(1)),
          diskGB: 10 + Math.floor(progress / 2),
          dailyBandwidthGB: parseFloat((progress * 0.5 + Math.random()).toFixed(2)),
          monthlyBandwidthGB: parseFloat((progress * 15 + Math.random() * 10).toFixed(2)),
          requestsPerSecond: Math.floor(50 + Math.random() * 200),
          estimatedDailyVisitors: Math.floor(progress * 100 + Math.random() * 500),
        };
        onMetrics(metrics);

        // 4. Emit Chart Data
        onChartData({
          time: new Date().toLocaleTimeString(),
          bandwidth: metrics.requestsPerSecond, // Using RPS as visual proxy
          requests: metrics.requestsPerSecond
        });

        // 5. Completion
        if (progress >= 100) {
          if (simulationInterval.current) clearInterval(simulationInterval.current);
          onDone({
            recommendedCpu: 4,
            recommendedRam: 8,
            recommendedDisk: 100,
            maxDailyTraffic: 50000,
            confidenceScore: 94,
          });
          onLog({
            id: 'done',
            timestamp: new Date().toLocaleTimeString(),
            message: 'Scan completed successfully.',
            type: 'success'
          });
        }

      }, 100); // Fast simulation

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