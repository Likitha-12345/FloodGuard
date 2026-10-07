import React from 'react';
import {
  StreetFeature,
  RiskLevel
} from '../types/flood';
import {
  X,
  TrendingUp,
  Gauge,
  Mountain,
  Building2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Droplet
} from 'lucide-react';

interface StreetInspectorProps {
  street: StreetFeature | null;
  onClose: () => void;
  onCheckTripFromHere?: (label: string) => void;
  onCheckTripToHere?: (label: string) => void;
  timeOffsetMin: number;
}

export const StreetInspector: React.FC<StreetInspectorProps> = ({
  street,
  onClose,
  onCheckTripFromHere,
  onCheckTripToHere,
  timeOffsetMin
}) => {
  if (!street) return null;

  const currentStep = street.forecast.find(s => s.timeOffsetMin === timeOffsetMin) || street.forecast[0] || {
    predictedDepthCm: street.currentDepthCm || 0,
    floodProbability: street.currentProbability || 0,
    riskLevel: street.currentRisk || 'safe',
    drainUtilization: street.currentDrainUtilization || 0,
    flowVelocityMs: 0
  };

  // Compute peak depth and peak arrival time
  const maxForecastStep = street.forecast.reduce((max, step) =>
    step.predictedDepthCm > max.predictedDepthCm ? step : max
  , street.forecast[0] || currentStep);

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'severe':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">SEVERE INUNDATION</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-950 text-orange-300 border border-orange-800">HIGH RISK</span>;
      case 'moderate':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">MODERATE RISK</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">PASSABLE / SAFE</span>;
    }
  };

  return (
    <div className="bg-slate-900 border-l border-slate-800 text-white w-full sm:w-[380px] lg:w-[420px] flex flex-col h-full shadow-2xl z-20 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-900/90 sticky top-0 backdrop-blur-md z-10">
        <div>
          <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
            Street-Level Telemetry
          </span>
          <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
            {street.name}
          </h2>
          <p className="text-xs text-slate-400">{street.neighborhood}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700">
          <div>
            <div className="text-[11px] text-slate-400">Current Risk Rating</div>
            <div className="mt-1">{getRiskBadge(currentStep.riskLevel)}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Flood Probability</div>
            <div className="text-xl font-extrabold text-cyan-300">{currentStep.floodProbability}%</div>
          </div>
        </div>

        {/* Depth & Peak Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Estimated Depth (T+{timeOffsetMin}m)</span>
            </div>
            <div className="mt-1.5 text-2xl font-black text-white">
              {currentStep.predictedDepthCm}
              <span className="text-xs text-slate-400 font-normal ml-1">cm</span>
            </div>
            <div className="text-[10px] text-cyan-400 font-medium">
              Estimated depth
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Velocity: {currentStep.flowVelocityMs} m/s
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
              <span>Estimated Peak 3-Hour</span>
            </div>
            <div className="mt-1.5 text-2xl font-black text-orange-400">
              {maxForecastStep.predictedDepthCm}
              <span className="text-xs text-slate-400 font-normal ml-1">cm</span>
            </div>
            <div className="text-[10px] text-orange-400 font-medium">
              Estimated depth
            </div>
            <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Peak at +{maxForecastStep.timeOffsetMin} min</span>
            </div>
          </div>
        </div>

        {/* 3-Hour Forecast Bar Chart */}
        <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">
              3-Hour Nowcast Trend (15-min intervals)
            </span>
            <span className="text-[10px] text-slate-400">Depth in cm</span>
          </div>

          <div className="grid grid-cols-12 gap-1 items-end h-28 pt-4">
            {street.forecast.map((step) => {
              const maxD = Math.max(1, maxForecastStep.predictedDepthCm, 40);
              const barHeightPct = Math.min(100, Math.max(6, (step.predictedDepthCm / maxD) * 100));
              const isCurrent = step.timeOffsetMin === timeOffsetMin;

              let barColor = 'bg-emerald-500';
              if (step.predictedDepthCm >= 30) barColor = 'bg-rose-500';
              else if (step.predictedDepthCm >= 15) barColor = 'bg-orange-500';
              else if (step.predictedDepthCm >= 5) barColor = 'bg-amber-500';

              return (
                <div key={step.timeOffsetMin} className="flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-950 text-white text-[10px] py-0.5 px-1.5 rounded border border-slate-700 pointer-events-none whitespace-nowrap z-20">
                    +{step.timeOffsetMin}m: {step.predictedDepthCm}cm
                  </div>

                  <div
                    style={{ height: `${barHeightPct}%` }}
                    className={`w-full rounded-t transition-all ${barColor} ${
                      isCurrent ? 'ring-2 ring-white shadow-lg' : 'opacity-80 group-hover:opacity-100'
                    }`}
                  />
                  <span className={`text-[8px] mt-1 text-slate-400 font-mono ${isCurrent ? 'font-bold text-white' : ''}`}>
                    {step.timeOffsetMin}m
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drainage & Terrain Hydrology Profile */}
        <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-2.5">
          <div className="text-xs font-semibold text-slate-300 border-b border-slate-700/80 pb-1.5">
            Geospatial & Hydraulic Parameters
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Mountain className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">DEM Elevation</div>
                <div className="font-semibold">{street.demElevationM} m ASL</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">Terrain Slope</div>
                <div className="font-semibold">{street.slopePercent}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">Depression Index</div>
                <div className="font-semibold text-amber-300">{street.depressionIndex} (Sink Propensity)</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">Impervious Surface</div>
                <div className="font-semibold">{street.imperviousPercent}% concrete</div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
              Drainage Utilization:
            </span>
            <span className={`font-bold ${currentStep.drainUtilization > 80 ? 'text-rose-400' : 'text-blue-300'}`}>
              {currentStep.drainUtilization}%
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Distance to drainage canal: <span className="text-slate-200 font-medium">{street.distanceToWaterbodyM} meters</span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onCheckTripFromHere?.(street.name);
              }}
              className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Check trip from here</span>
            </button>

            <button
              onClick={() => {
                onCheckTripToHere?.(street.name);
              }}
              className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Check trip to here</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
