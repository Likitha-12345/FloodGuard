import React from 'react';
import {
  CloudRain,
  Radio,
  Clock,
  ChevronDown,
  RefreshCw,
  SlidersHorizontal,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { CityId, RainfallScenario } from '../types/flood';
import { CITIES_INFO, INITIAL_RAINFALL_SCENARIOS } from '../data/citiesData';

interface TopNavProps {
  currentCity: CityId;
  onCityChange: (city: CityId) => void;
  activeScenario: RainfallScenario;
  onScenarioChange: (scenarioId: string) => void;
  onOpenIngestModal: () => void;
  onRefreshData?: () => void;
  lastUpdatedTime: string;
  isLoadingLive?: boolean;
  liveError?: string | null;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentCity,
  onCityChange,
  activeScenario,
  onScenarioChange,
  onOpenIngestModal,
  onRefreshData,
  lastUpdatedTime,
  isLoadingLive = false,
  liveError = null
}) => {
  const city = CITIES_INFO[currentCity];
  const isLiveMode = activeScenario.id === 'live' || activeScenario.source === 'api';

  return (
    <header className="h-14 bg-slate-900/95 border-b border-slate-800 text-white px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-20 backdrop-blur-md">
      {/* Left: City Selector & Status */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* City Selector Dropdown / Pills */}
        <div className="flex items-center bg-slate-800/90 p-0.5 rounded-xl border border-slate-700/80 text-xs font-semibold">
          {(['mumbai', 'delhi', 'chennai'] as CityId[]).map((cId) => (
            <button
              key={cId}
              onClick={() => onCityChange(cId)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentCity === cId
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-900/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              {CITIES_INFO[cId].name}
            </button>
          ))}
        </div>

        {/* Weather / Event Status Pill */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-xs">
          <CloudRain className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-200 font-medium truncate max-w-[200px]">
            {activeScenario.intensityMmHr === 0 ? 'Clear / No Rain' : activeScenario.name}
          </span>
          <span className="text-cyan-400 font-mono font-bold text-[11px]">
            {activeScenario.intensityMmHr} mm/h
          </span>
        </div>
      </div>

      {/* Right: Data Status, Timestamp, & Ingest */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Live Data Status Indicator & Honesty Badge */}
        {isLoadingLive ? (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 text-xs font-semibold">
            <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
            <span>Fetching live rainfall...</span>
          </div>
        ) : liveError && isLiveMode ? (
          <div
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs font-semibold"
            title={liveError}
          >
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Live data unavailable</span>
          </div>
        ) : isLiveMode ? (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live rainfall: Open-Meteo</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Demo scenario</span>
          </div>
        )}

        {/* Timestamp */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Updated: <strong className="text-slate-200">{lastUpdatedTime}</strong></span>
        </div>

        {/* Scenario Switcher / Ingestion Trigger */}
        <div className="flex items-center space-x-1">
          <select
            value={activeScenario.id}
            onChange={(e) => onScenarioChange(e.target.value)}
            className="hidden sm:inline-block bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none cursor-pointer max-w-[190px] truncate font-medium"
          >
            {INITIAL_RAINFALL_SCENARIOS.map((sc) => (
              <option key={sc.id} value={sc.id} className="bg-slate-900 text-white">
                {sc.name}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenIngestModal}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Custom Radar / Weather Ingestion"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">Ingest</span>
          </button>
        </div>
      </div>
    </header>
  );
};
