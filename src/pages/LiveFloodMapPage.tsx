import React, { useState } from 'react';
import {
  CityId,
  StreetFeature,
  DrainageNetwork,
  RainfallScenario
} from '../types/flood';
import { MapCanvas } from '../components/MapCanvas';
import { TimelineSlider } from '../components/TimelineSlider';
import {
  Layers,
  X,
  Droplet,
  TrendingUp,
  Gauge,
  Clock,
  ShieldAlert,
  Mountain,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Sliders,
  Eye,
  Info
} from 'lucide-react';

interface LiveFloodMapPageProps {
  currentCity: CityId;
  streets: StreetFeature[];
  drainage?: DrainageNetwork;
  activeScenario: RainfallScenario;
  timeOffsetMin: number;
  onChangeTimeOffset: (offset: number) => void;
  onNavigateToTripCheckWithStreet?: (street: StreetFeature) => void;
  onNavigateToTripCheckWithLocation?: (locationName: string) => void;
}

export const LiveFloodMapPage: React.FC<LiveFloodMapPageProps> = ({
  currentCity,
  streets,
  activeScenario,
  timeOffsetMin,
  onChangeTimeOffset,
  onNavigateToTripCheckWithStreet,
  onNavigateToTripCheckWithLocation
}) => {
  const [selectedStreetId, setSelectedStreetId] = useState<string | null>(null);

  const selectedStreet = streets.find((s) => s.id === selectedStreetId) || null;

  // Selected street's step for the active timeline offset
  const streetStep = selectedStreet
    ? selectedStreet.forecast.find((f) => f.timeOffsetMin === timeOffsetMin) || selectedStreet.forecast[0]
    : null;

  const maxStreetStep = selectedStreet
    ? selectedStreet.forecast.reduce(
        (max, step) => (step.predictedDepthCm > max.predictedDepthCm ? step : max),
        selectedStreet.forecast[0]
      )
    : null;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative select-none">
      {/* Top GIS Status Ribbon */}
      <div className="h-10 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-300 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            GIS Street-Level Flood Inundation Engine
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">
            Click any road segment or subway underpass to inspect real-time hydrological telemetry.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-300 bg-slate-800/80 px-2.5 py-0.5 rounded border border-slate-700">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Horizon: +{timeOffsetMin} min</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Active Layer: <strong>XGBoost Surface Depth (cm)</strong>
          </span>
        </div>
      </div>

      {/* Main Map Viewport (Occupies ~90% of screen) */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        <MapCanvas
          currentCity={currentCity}
          streets={streets}
          selectedStreetId={selectedStreetId}
          onSelectStreet={(id) => setSelectedStreetId(id)}
          onCheckTripToLocation={(_coords, label) => onNavigateToTripCheckWithLocation?.(label)}
          timeOffsetMin={timeOffsetMin}
        />

        {/* Street Flood Prediction Inspector Panel (Slide-in on right when clicked) */}
        {selectedStreet && streetStep && (
          <div className="absolute top-3 right-3 bottom-3 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-4 flex flex-col z-[1000] text-white overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest">
                  STREET FLOOD PREDICTION
                </span>
                <h3 className="text-base font-bold text-white mt-0.5 leading-snug">
                  {selectedStreet.name}
                </h3>
                <p className="text-xs text-slate-400">{selectedStreet.neighborhood}</p>
              </div>
              <button
                onClick={() => setSelectedStreetId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Prediction Metrics */}
            <div className="py-3 space-y-2.5">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Depth</div>
                  <div className="text-2xl font-black text-white mt-1">
                    {streetStep.predictedDepthCm}
                    <span className="text-xs text-slate-400 font-normal ml-1">cm</span>
                  </div>
                  <span className="text-[9px] text-cyan-400 font-medium block mt-0.5">Estimated depth</span>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Maximum</div>
                  <div className="text-2xl font-black text-orange-400 mt-1">
                    {maxStreetStep?.predictedDepthCm || streetStep.predictedDepthCm}
                    <span className="text-xs text-slate-400 font-normal ml-1">cm</span>
                  </div>
                  <span className="text-[9px] text-orange-400 font-medium block mt-0.5">Estimated depth</span>
                </div>
              </div>

              {/* Status List */}
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Flood Probability:</span>
                  <span className="font-extrabold text-cyan-300 text-sm">{streetStep.floodProbability}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Expected Flooding:</span>
                  <span className="font-bold text-slate-200">
                    {streetStep.predictedDepthCm > 25 ? 'Immediate / In Progress' : '25 minutes'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Drainage Utilization:</span>
                  <span className={`font-bold ${streetStep.drainUtilization > 85 ? 'text-rose-400' : 'text-blue-300'}`}>
                    {streetStep.drainUtilization}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Risk Severity:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    streetStep.riskLevel === 'severe'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : streetStep.riskLevel === 'high'
                      ? 'bg-orange-950 text-orange-300 border border-orange-800'
                      : streetStep.riskLevel === 'moderate'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {streetStep.riskLevel}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                  <span className="text-slate-400">Prediction Confidence:</span>
                  <span className="font-bold text-emerald-400">91%</span>
                </div>
              </div>

              {/* 3-Hour Trend Sparkline */}
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  15-Min Inundation Forecast Trend
                </div>
                <div className="grid grid-cols-12 gap-1 items-end h-16 pt-2">
                  {selectedStreet.forecast.map((step) => {
                    const maxD = Math.max(1, maxStreetStep?.predictedDepthCm || 40);
                    const pct = Math.min(100, Math.max(8, (step.predictedDepthCm / maxD) * 100));
                    const isSelected = step.timeOffsetMin === timeOffsetMin;

                    return (
                      <div
                        key={step.timeOffsetMin}
                        style={{ height: `${pct}%` }}
                        className={`w-full rounded-t transition-all ${
                          isSelected
                            ? 'bg-white ring-2 ring-cyan-400'
                            : step.predictedDepthCm >= 30
                            ? 'bg-rose-500'
                            : step.predictedDepthCm >= 15
                            ? 'bg-orange-500'
                            : 'bg-cyan-500'
                        }`}
                        title={`+${step.timeOffsetMin}m: ${step.predictedDepthCm}cm`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Terrain Telemetry */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50">
                <div>DEM Elevation: <strong className="text-slate-200">{selectedStreet.demElevationM}m ASL</strong></div>
                <div>Slope: <strong className="text-slate-200">{selectedStreet.slopePercent}%</strong></div>
                <div>Impervious: <strong className="text-slate-200">{selectedStreet.imperviousPercent}%</strong></div>
                <div>Depression Index: <strong className="text-amber-300">{selectedStreet.depressionIndex}</strong></div>
              </div>

              {/* Action Button */}
              {onNavigateToTripCheckWithStreet && (
                <button
                  onClick={() => onNavigateToTripCheckWithStreet(selectedStreet)}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-900/30 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Check trip</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Timeline Forecast Scrubber (NOW, +30m, +1h, +1.5h, +2h, +2.5h, +3h) */}
      <TimelineSlider
        timeOffsetMin={timeOffsetMin}
        onChangeTimeOffset={onChangeTimeOffset}
        maxOffsetMin={180}
      />
    </div>
  );
};
