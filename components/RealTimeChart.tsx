import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';

interface RealTimeChartProps {
  data: ChartDataPoint[];
}

export const RealTimeChart: React.FC<RealTimeChartProps> = ({ data }) => {
  // Only show last 30 points
  const displayData = data.slice(-30);

  return (
    <div className="glass-panel p-4 rounded-xl h-80 relative">
      <div className="absolute top-4 left-4 z-10">
         <h3 className="text-slate-300 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            Live Request Volume
         </h3>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={displayData}
          margin={{
            top: 40,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#64748b" 
            tick={{fontSize: 10}} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b" 
            tick={{fontSize: 10}} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#e2e8f0' }}
            itemStyle={{ color: '#06b6d4' }}
          />
          <Area 
            type="monotone" 
            dataKey="requests" 
            stroke="#06b6d4" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorBandwidth)" 
            isAnimationActive={false} // Disable internal animation for smoother real-time feel
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};