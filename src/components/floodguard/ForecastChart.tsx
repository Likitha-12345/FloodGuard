import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  ArrowDown,
  Info,
  Calendar
} from 'lucide-react';
import { THREE_HOUR_FORECAST, ForecastPoint } from '../../data/mumbaiFloodConstants';

export const ForecastChart: React.FC = () => {
  const [hoveredPoint, setHoveredPoint] = useState<ForecastPoint | null>(null);

  const data = THREE_HOUR_FORECAST;
  const maxDepth = Math.max(...data.map(d => d.depthCm), 160);
  const minDepth = 0;
  const chartHeight = 180;
  const chartWidth = 600;

  // Generate SVG area and polyline path
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * chartWidth;
    const y = chartHeight - ((d.depthCm - minDepth) / (maxDepth - minDepth)) * (chartHeight - 30) - 15;
    return { x, y, data: d };
  });

  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  const areaPath = `${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  // Find peak point
  const peak = points.reduce((prev, curr) => (curr.data.depthCm > prev.data.depthCm ? curr : prev), points[0]);
  // Point for recede annotation (+1.5h)
  const recedePoint = points.find(p => p.data.offsetMin === 90) || points[5];

  return (
    <section className="bg-[#111A2E] border border-[#1E2D4A] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#1E2D4A]">
        <div>
          <span className="text-xs font-bold text-[#FFA940] uppercase tracking-wider block">
            PREDICTIVE HYDROLOGY
          </span>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#38BDF8]" />
            <span>Flood Risk Next 3 Hours</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-[#FF4D4F]/15 text-[#FF4D4F] border border-[#FF4D4F]/30 font-bold">
            Peak: ~154 cm at +45m
          </span>
          <span className="px-3 py-1 rounded-full bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30 font-bold">
            Receding after 1 hr
          </span>
        </div>
      </div>

      {/* SVG Interactive Area Chart */}
      <div className="relative pt-4 pb-2">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-48 sm:h-56 overflow-visible select-none"
        >
          <defs>
            <linearGradient id="floodAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF4D4F" stopOpacity="0.45" />
              <stop offset="40%" stopColor="#FFA940" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2ECC71" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="floodStrokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF4D4F" />
              <stop offset="50%" stopColor="#FFA940" />
              <stop offset="100%" stopColor="#2ECC71" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="#1E2D4A" strokeDasharray="4 4" />
          <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="#1E2D4A" strokeDasharray="4 4" />
          <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="#1E2D4A" strokeDasharray="4 4" />

          {/* Area fill */}
          <path d={areaPath} fill="url(#floodAreaGradient)" />

          {/* Line stroke */}
          <path d={linePath} fill="none" stroke="url(#floodStrokeGradient)" strokeWidth="3.5" strokeLinecap="round" />

          {/* Peak Marker Badge */}
          {peak && (
            <g transform={`translate(${peak.x}, ${peak.y})`}>
              <circle r="6" fill="#FF4D4F" stroke="#FFFFFF" strokeWidth="2.5" />
              <rect x="-45" y="-30" width="90" height="20" rx="5" fill="#0B1220" stroke="#FF4D4F" strokeWidth="1.5" />
              <text x="0" y="-16" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
                Peak: {peak.data.depthCm} cm
              </text>
            </g>
          )}

          {/* "Expected to recede after 1h" Marker */}
          {recedePoint && (
            <g transform={`translate(${recedePoint.x}, ${recedePoint.y})`}>
              <circle r="5" fill="#2ECC71" stroke="#FFFFFF" strokeWidth="2" />
              <rect x="-65" y="-28" width="130" height="18" rx="4" fill="#0B1220" stroke="#2ECC71" strokeWidth="1" />
              <text x="0" y="-16" textAnchor="middle" fill="#2ECC71" fontSize="9" fontWeight="bold">
                ▼ Expected to recede after 1h
              </text>
            </g>
          )}

          {/* Interactive Hover Dots */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="7"
              className="fill-white stroke-[#0B1220] stroke-2 hover:fill-[#38BDF8] cursor-pointer transition-transform hover:scale-125 opacity-70 hover:opacity-100"
              onMouseEnter={() => setHoveredPoint(p.data)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* X-Axis Time Milestones */}
        <div className="flex justify-between items-center text-xs text-slate-400 font-mono pt-2 px-1 border-t border-[#1E2D4A]">
          <span>Now</span>
          <span>+30 min</span>
          <span className="text-[#FF4D4F] font-bold">+45m (Peak)</span>
          <span>+1 hr</span>
          <span>+2 hr</span>
          <span className="text-[#2ECC71] font-bold">+3 hr (Safe)</span>
        </div>
      </div>

      {/* Dynamic Interpretation Sentence */}
      <div className="p-3.5 rounded-xl bg-[#0B1220]/80 border border-[#1E2D4A] flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <ArrowDown className="w-4 h-4 text-[#2ECC71]" />
          <span>
            {hoveredPoint ? (
              <strong className="text-white">
                {hoveredPoint.timeLabel}: Predicted Water Depth {hoveredPoint.depthCm} cm ({hoveredPoint.rainfallMmHr} mm/hr rain)
              </strong>
            ) : (
              <span>
                Water depth is expected to <strong className="text-[#FF4D4F]">surge to 154 cm</strong> at T+45m, followed by a <strong className="text-[#2ECC71]">steady drop below 20 cm</strong> after 3 hours.
              </span>
            )}
          </span>
        </div>
      </div>
    </section>
  );
};
