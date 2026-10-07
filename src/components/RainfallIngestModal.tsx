import React, { useState } from 'react';
import { CityId, RainfallScenario } from '../types/flood';
import { CITIES_INFO } from '../data/citiesData';
import {
  CloudRain,
  Radio,
  X,
  Database,
  History,
  CheckCircle,
  Sliders,
  Wind
} from 'lucide-react';

interface RainfallIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: CityId;
  onIngest: (customData: Partial<RainfallScenario>) => void;
}

export const RainfallIngestModal: React.FC<RainfallIngestModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  onIngest
}) => {
  const [source, setSource] = useState<'radar' | 'api' | 'historical' | 'simulated'>('radar');
  const [intensity, setIntensity] = useState<number>(65.0);
  const [radarDbz, setRadarDbz] = useState<number>(52.0);
  const [cum1h, setCum1h] = useState<number>(55.0);
  const [cum3h, setCum3h] = useState<number>(120.0);
  const [cum6h, setCum6h] = useState<number>(185.0);
  const [stationName, setStationName] = useState<string>(
    `IMD Doppler Radar ${CITIES_INFO[currentCity].name} Regional Station`
  );

  if (!isOpen) return null;

  const handleApplyPreset = (presetType: 'mumbai_2005' | 'chennai_2015' | 'delhi_2023') => {
    if (presetType === 'mumbai_2005') {
      setSource('historical');
      setIntensity(92.0);
      setRadarDbz(58.5);
      setCum1h(110.0);
      setCum3h(235.0);
      setCum6h(380.0);
      setStationName('Historical Log: Mumbai 26 July 2005 Super Cloudburst');
    } else if (presetType === 'chennai_2015') {
      setSource('historical');
      setIntensity(78.0);
      setRadarDbz(54.0);
      setCum1h(85.0);
      setCum3h(190.0);
      setCum6h(310.0);
      setStationName('Historical Log: Chennai 1 Dec 2015 Adyar Deluge');
    } else {
      setSource('historical');
      setIntensity(52.0);
      setRadarDbz(49.0);
      setCum1h(60.0);
      setCum3h(140.0);
      setCum6h(220.0);
      setStationName('Historical Log: Delhi July 2023 Yamuna Inflow Surge');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onIngest({
      name: `Ingested ${source.toUpperCase()} Observation`,
      source,
      intensityMmHr: Number(intensity),
      radarDbz: Number(radarDbz),
      cum1hMm: Number(cum1h),
      cum3hMm: Number(cum3h),
      cum6hMm: Number(cum6h),
      stationName
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl text-white overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Rainfall Ingestion Pipeline</h3>
              <p className="text-xs text-slate-400">Doppler Radar, Weather API & Historical Replay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Historical Presets Quick-Bar */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Historical Deluge Benchmarks:</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleApplyPreset('mumbai_2005')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left hover:border-cyan-500/50 transition-colors"
              >
                <div className="font-bold text-slate-200">Mumbai 2005</div>
                <div className="text-[10px] text-slate-400">92 mm/h peak</div>
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('chennai_2015')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left hover:border-cyan-500/50 transition-colors"
              >
                <div className="font-bold text-slate-200">Chennai 2015</div>
                <div className="text-[10px] text-slate-400">78 mm/h peak</div>
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('delhi_2023')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left hover:border-cyan-500/50 transition-colors"
              >
                <div className="font-bold text-slate-200">Delhi 2023</div>
                <div className="text-[10px] text-slate-400">52 mm/h surge</div>
              </button>
            </div>
          </div>

          {/* Telemetry Input Sliders */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-3.5">
            {/* Intensity */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Instantaneous Rainfall Rate:</span>
                <span className="font-bold text-cyan-400">{intensity} mm/hr</span>
              </div>
              <input
                type="range"
                min={0}
                max={120}
                step={2}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Radar Reflectivity dBZ */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Doppler Radar Reflectivity:</span>
                <span className="font-bold text-orange-400">{radarDbz} dBZ</span>
              </div>
              <input
                type="range"
                min={15}
                max={65}
                step={1}
                value={radarDbz}
                onChange={(e) => setRadarDbz(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Cumulative 1h & 3h */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] text-slate-400">Cumulative 1-Hour (mm)</label>
                <input
                  type="number"
                  value={cum1h}
                  onChange={(e) => setCum1h(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Cumulative 3-Hour (mm)</label>
                <input
                  type="number"
                  value={cum3h}
                  onChange={(e) => setCum3h(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>

            {/* Station Label */}
            <div>
              <label className="text-[10px] text-slate-400">Observational Source / Sensor Feed Tag</label>
              <input
                type="text"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-900/40"
            >
              Feed to ML Regressor & Recalculate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
