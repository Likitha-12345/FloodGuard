import React from 'react';
import {
  AlertOctagon,
  Waves,
  Droplets,
  Activity,
  Radio,
  CheckCircle2,
  Gauge,
  TrendingUp
} from 'lucide-react';
import { DashboardSummary } from '../types/flood';

interface SummaryCardsProps {
  summary: DashboardSummary | null;
  timeOffsetMin: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, timeOffsetMin }) => {
  if (!summary) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-3 bg-slate-900/60 border-b border-slate-800">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-800/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const getDepthSeverityClass = (depth: number) => {
    if (depth >= 30) return 'text-rose-400 border-rose-800/60 bg-rose-950/40';
    if (depth >= 15) return 'text-orange-400 border-orange-800/60 bg-orange-950/40';
    if (depth >= 5) return 'text-amber-400 border-amber-800/60 bg-amber-950/40';
    return 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40';
  };

  const getDrainageSeverityClass = (util: number) => {
    if (util >= 85) return 'text-rose-400 border-rose-800/60 bg-rose-950/40';
    if (util >= 70) return 'text-orange-400 border-orange-800/60 bg-orange-950/40';
    return 'text-cyan-400 border-cyan-800/60 bg-cyan-950/40';
  };

  return (
    <div className="bg-slate-900/95 border-b border-slate-800 p-2 sm:p-3 select-none">
      <div className="max-w-[1920px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Card 1: Streets at Risk */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-2.5 flex flex-col justify-between hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Streets at Risk</span>
            <AlertOctagon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {summary.streetsAtRisk}
              <span className="text-xs text-slate-400 font-normal ml-1">
                / {summary.totalStreetsTracked}
              </span>
            </div>
            {summary.severeStreetsCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                {summary.severeStreetsCount} Severe
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Water depth &gt; 5cm</span>
            <span className="text-amber-400 font-medium">
              {Math.round((summary.streetsAtRisk / Math.max(1, summary.totalStreetsTracked)) * 100)}% network
            </span>
          </div>
        </div>

        {/* Card 2: High-Risk Intersections */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-2.5 flex flex-col justify-between hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Subway / Sinks</span>
            <Waves className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {summary.highRiskIntersectionsCount}
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-700/60 px-1.5 py-0.5 rounded border border-slate-600">
              Low DEM Sinks
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            <span className="text-orange-300 font-medium">Depression index &gt; 0.80</span>
          </div>
        </div>

        {/* Card 3: Max Water Depth */}
        <div className={`border rounded-xl p-2.5 flex flex-col justify-between transition-colors ${getDepthSeverityClass(summary.maxWaterDepthCm)}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Max Water Depth</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div>
              <div className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {summary.maxWaterDepthCm}
                <span className="text-xs font-medium ml-1">cm</span>
              </div>
              <span className="text-[10px] opacity-75 block font-medium">Estimated depth</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border">
              {summary.maxWaterDepthCm >= 30 ? 'Severe Alert' : summary.maxWaterDepthCm >= 15 ? 'High Risk' : summary.maxWaterDepthCm >= 5 ? 'Moderate' : 'Safe'}
            </span>
          </div>
          <div className="mt-1 text-[11px] opacity-80">
            <span>Forecast horizon: +{timeOffsetMin} min</span>
          </div>
        </div>

        {/* Card 4: Drainage Utilization */}
        <div className={`border rounded-xl p-2.5 flex flex-col justify-between transition-colors ${getDrainageSeverityClass(summary.averageDrainUtilizationPercent)}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Drainage Load</span>
            <Gauge className="w-4 h-4" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-bold tracking-tight">
              {summary.averageDrainUtilizationPercent}
              <span className="text-xs font-medium ml-0.5">%</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-slate-900/40 border">
              Manning Flow
            </span>
          </div>
          <div className="mt-1 text-[11px] opacity-85">
            {summary.averageDrainUtilizationPercent >= 80 ? '⚠️ Surcharging into streets' : 'Nominal hydraulic discharge'}
          </div>
        </div>

        {/* Card 5: Rainfall Rate */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-2.5 flex flex-col justify-between hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Rainfall Rate</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {summary.rainfallIntensityMmHr}
              <span className="text-xs text-slate-400 font-normal ml-1">mm/h</span>
            </div>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {summary.rainfallIntensityMmHr > 0 ? (summary.radarDbz > 0 ? `${summary.radarDbz} dBZ` : 'Precipitation') : 'Clear'}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 truncate">
            {summary.weatherCondition}
          </div>
        </div>

        {/* Card 6: Model & Confidence */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-2.5 flex flex-col justify-between hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Nowcast Confidence</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-bold text-emerald-300 tracking-tight">
              {summary.forecastConfidencePercent}%
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300 border border-slate-600 font-mono">
              XGB-v2.1
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="truncate">DEM + Rational SWMM</span>
            <span className="text-emerald-400 text-[10px] font-bold">CALIBRATED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
