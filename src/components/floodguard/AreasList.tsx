import React, { useState } from 'react';
import {
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { FloodArea, LanguageStrings } from '../../data/mumbaiFloodConstants';

interface AreasListProps {
  areas: FloodArea[];
  t: LanguageStrings;
  onSelectArea: (area: FloodArea) => void;
  selectedAreaId: string | null;
}

export const AreasList: React.FC<AreasListProps> = ({
  areas,
  t,
  onSelectArea,
  selectedAreaId
}) => {
  const [filter, setFilter] = useState<'all' | 'subway' | 'road' | 'low-lying'>('all');

  const filteredAreas = areas.filter((area) => {
    if (filter === 'all') return true;
    return area.category === filter;
  });

  const getStatusBadge = (status: FloodArea['status']) => {
    switch (status) {
      case 'severe':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-[#FF4D4F]/20 text-[#FF4D4F] border border-[#FF4D4F]/40 animate-pulse">Severe Flooding</span>;
      case 'high':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#FFA940]/20 text-[#FFA940] border border-[#FFA940]/40">High Flood Risk</span>;
      case 'moderate':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#F1C40F]/20 text-[#F1C40F] border border-[#F1C40F]/40">Moderate Flooding</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/40">Passable</span>;
    }
  };

  const getTrendIcon = (trend: FloodArea['trend'], rate: number) => {
    if (trend === 'rising') {
      return (
        <span className="flex items-center gap-1 text-xs font-bold text-[#FF4D4F]" title={`Rising at +${rate} cm / 15m`}>
          <TrendingUp className="w-3.5 h-3.5" />
          <span>▲ Rising (+{rate}cm)</span>
        </span>
      );
    }
    if (trend === 'falling') {
      return (
        <span className="flex items-center gap-1 text-xs font-bold text-[#2ECC71]" title={`Falling at ${rate} cm / 15m`}>
          <TrendingDown className="w-3.5 h-3.5" />
          <span>▼ Falling ({rate}cm)</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
        <Minus className="w-3.5 h-3.5" />
        <span>— Stable</span>
      </span>
    );
  };

  return (
    <section className="bg-[#111A2E] border border-[#1E2D4A] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Title & Filter Chips */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2D4A]">
        <div>
          <span className="text-xs font-bold text-[#FF4D4F] uppercase tracking-wider block">
            HIGH-HAZARD SECTORS
          </span>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
            {t.areasToAvoid} (Ranked by Inundation)
          </h2>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 bg-[#0B1220] p-1 rounded-xl border border-[#1E2D4A] text-xs font-medium">
          {[
            { id: 'all', label: `All (${areas.length})` },
            { id: 'subway', label: `Subways (${areas.filter(a => a.category === 'subway').length})` },
            { id: 'road', label: `Roads (${areas.filter(a => a.category === 'road').length})` },
            { id: 'low-lying', label: `Low-lying (${areas.filter(a => a.category === 'low-lying').length})` }
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilter(chip.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === chip.id
                  ? 'bg-[#38BDF8] text-[#0B1220] font-black shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ranked List */}
      <div className="divide-y divide-[#1E2D4A]/80">
        {filteredAreas.map((area, idx) => {
          const isSelected = selectedAreaId === area.id;
          const progressPercent = Math.min(100, Math.round((area.depthCm / 150) * 100));

          return (
            <div
              key={area.id}
              className={`py-4 px-2.5 rounded-xl transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isSelected ? 'bg-[#1E2D4A]/70 ring-1 ring-[#38BDF8]' : 'hover:bg-[#0B1220]/50'
              }`}
            >
              {/* Left Column: Rank + Name + Locality + Status */}
              <div className="flex items-start gap-3.5 min-w-0 max-w-xl">
                <div className="w-7 h-7 rounded-lg bg-[#0B1220] border border-[#1E2D4A] flex items-center justify-center text-xs font-mono font-bold text-slate-300 shrink-0 mt-0.5">
                  #{idx + 1}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight truncate">
                      {area.name}
                    </h3>
                    {getStatusBadge(area.status)}
                  </div>

                  <p className="text-xs text-slate-300 font-normal">
                    {area.locality}
                  </p>

                  {/* Depth Progress Bar */}
                  <div className="w-full sm:w-80 space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>Water Accumulation</span>
                      <strong className="text-white">{area.depthCm} cm</strong>
                    </div>
                    <div className="w-full bg-[#0B1220] h-2 rounded-full overflow-hidden border border-[#1E2D4A]/80">
                      <div
                        style={{ width: `${progressPercent}%` }}
                        className={`h-full rounded-full ${
                          area.status === 'severe'
                            ? 'bg-[#FF4D4F]'
                            : area.status === 'high'
                            ? 'bg-[#FFA940]'
                            : 'bg-[#F1C40F]'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Trend + Updated Stamp + Big View Button */}
              <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1E2D4A]/60">
                <div className="text-left md:text-right space-y-0.5">
                  {getTrendIcon(area.trend, area.trendRateCm)}
                  <div className="text-[11px] text-slate-400">
                    Updated {area.updatedMinsAgo} min ago
                  </div>
                </div>

                <button
                  onClick={() => onSelectArea(area)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0B1220] hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#0B1220] border border-[#1E2D4A] hover:border-[#38BDF8] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  title="View on Map & Alternate Bypass Route"
                >
                  <span>View Details</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
