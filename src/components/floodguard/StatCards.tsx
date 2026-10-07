import React from 'react';
import {
  AlertOctagon,
  Waves,
  Droplets,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Car,
  Activity
} from 'lucide-react';
import { LanguageStrings } from '../../data/mumbaiFloodConstants';

interface StatCardsProps {
  t: LanguageStrings;
  maxDepthCm: number;
  rainfallRateMmHr: number;
  areasToAvoidCount: number;
}

// Mini SVG Sparkline component
const Sparkline: React.FC<{ data: number[]; color: string; height?: number }> = ({
  data,
  color,
  height = 24
}) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80;
  const step = width / (data.length - 1);

  const points = data
    .map((val, i) => {
      const x = i * step;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const StatCards: React.FC<StatCardsProps> = ({
  t,
  maxDepthCm,
  rainfallRateMmHr,
  areasToAvoidCount
}) => {
  // Visual Depth Scale Gauge calculation
  // Ankle: 15cm, Knee: 45cm, Waist/Car-Door: 90cm, Submerged: 120cm+
  const getDepthGaugeLevel = (cm: number) => {
    if (cm >= 120) return { label: 'Car Submerged (Over Roof)', color: 'text-[#FF4D4F]', fillPct: 100, icon: '🚗🌊' };
    if (cm >= 80) return { label: 'Waist / Car-Door Level', color: 'text-[#FF4D4F]', fillPct: 85, icon: '🚪🌊' };
    if (cm >= 40) return { label: 'Knee Depth (Stalls Cars)', color: 'text-[#FFA940]', fillPct: 60, icon: '🦵' };
    if (cm >= 15) return { label: 'Ankle Depth (Passable with Care)', color: 'text-[#FFA940]', fillPct: 35, icon: '🦶' };
    return { label: 'Pavement Surface Pooling', color: 'text-[#2ECC71]', fillPct: 15, icon: '👟' };
  };

  const depthGauge = getDepthGaugeLevel(maxDepthCm);

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. CURRENT RISK */}
      <div className="bg-[#111A2E] border border-[#1E2D4A] rounded-2xl p-5 flex flex-col justify-between hover:border-slate-600 transition-colors shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t.currentRisk}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#FF4D4F] bg-[#FF4D4F]/10 px-2 py-0.5 rounded-full border border-[#FF4D4F]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D4F] animate-pulse"></span>
            <span>▲ Rising</span>
          </span>
        </div>

        <div className="my-3">
          <div className="text-3xl sm:text-4xl font-black text-[#FF4D4F] tracking-tight">
            SEVERE
          </div>
          <div className="text-xs text-slate-300 font-medium mt-1">
            8 underpasses & roads critical
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#1E2D4A]/80 text-xs text-slate-400">
          <span>Past 1h trend</span>
          <Sparkline data={[65, 78, 88, 95, 100]} color="#FF4D4F" />
        </div>
      </div>

      {/* 2. MAX WATER DEPTH (With Human-Understandable Gauge) */}
      <div className="bg-[#111A2E] border border-[#1E2D4A] rounded-2xl p-5 flex flex-col justify-between hover:border-slate-600 transition-colors shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t.maxDepth}
          </span>
          <span className="text-xs font-bold text-[#FF4D4F] flex items-center gap-1">
            <Waves className="w-4 h-4 text-[#FF4D4F]" />
            <span>Hindmata Subway</span>
          </span>
        </div>

        <div className="my-2.5">
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums font-mono">
            {maxDepthCm} <span className="text-base text-slate-400 font-normal">cm</span>
          </div>

          {/* Visual Physical Depth Gauge (Ankle / Knee / Car Door / Submerged) */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className={depthGauge.color}>{depthGauge.label}</span>
              <span className="text-base">{depthGauge.icon}</span>
            </div>
            <div className="w-full bg-[#0B1220] h-2 rounded-full overflow-hidden border border-[#1E2D4A]">
              <div
                style={{ width: `${depthGauge.fillPct}%` }}
                className="h-full bg-gradient-to-r from-[#FFA940] to-[#FF4D4F] rounded-full transition-all duration-500"
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>Ankle (15cm)</span>
              <span>Knee (45cm)</span>
              <span>Car (90cm+)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#1E2D4A]/80 text-xs text-slate-400">
          <span>Water level trend</span>
          <Sparkline data={[110, 122, 134, 140, maxDepthCm]} color="#FF4D4F" />
        </div>
      </div>

      {/* 3. RAINFALL RATE */}
      <div className="bg-[#111A2E] border border-[#1E2D4A] rounded-2xl p-5 flex flex-col justify-between hover:border-slate-600 transition-colors shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t.rainRate}
          </span>
          <span className="text-xs font-bold text-[#38BDF8] flex items-center gap-1">
            <Droplets className="w-4 h-4 text-[#38BDF8]" />
            <span>▲ Heavy Rain</span>
          </span>
        </div>

        <div className="my-3">
          <div className="text-3xl sm:text-4xl font-black text-[#38BDF8] tracking-tight tabular-nums font-mono">
            {rainfallRateMmHr} <span className="text-base text-slate-400 font-normal">mm/hr</span>
          </div>
          <div className="text-xs text-slate-300 font-medium mt-1">
            Cloudburst intensity (&gt;50 mm/hr)
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#1E2D4A]/80 text-xs text-slate-400">
          <span>Precipitation curve</span>
          <Sparkline data={[32, 44, 52, 65, rainfallRateMmHr]} color="#38BDF8" />
        </div>
      </div>

      {/* 4. AREAS TO AVOID */}
      <div className="bg-[#111A2E] border border-[#1E2D4A] rounded-2xl p-5 flex flex-col justify-between hover:border-slate-600 transition-colors shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t.areasToAvoid}
          </span>
          <span className="text-xs font-bold text-[#FFA940] flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-[#FFA940]" />
            <span>Vehicles Blocked</span>
          </span>
        </div>

        <div className="my-3">
          <div className="text-3xl sm:text-4xl font-black text-[#FFA940] tracking-tight tabular-nums font-mono">
            {areasToAvoidCount}
          </div>
          <div className="text-xs text-slate-300 font-medium mt-1">
            5 subways closed • 4 bottlenecks
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#1E2D4A]/80 text-xs text-slate-400">
          <span>Active closures</span>
          <Sparkline data={[4, 5, 7, 8, areasToAvoidCount]} color="#FFA940" />
        </div>
      </div>
    </section>
  );
};
