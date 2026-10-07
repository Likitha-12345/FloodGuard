import React from 'react';
import { StreetFeature, CityId } from '../types/flood';
import {
  X,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Car,
  Clock
} from 'lucide-react';

interface AreaDetailDrawerProps {
  street: StreetFeature | null;
  onClose: () => void;
  onNavigateAround: (street: StreetFeature) => void;
  isEmergencyMode?: boolean;
}

export const AreaDetailDrawer: React.FC<AreaDetailDrawerProps> = ({
  street,
  onClose,
  onNavigateAround,
  isEmergencyMode = false
}) => {
  if (!street) return null;

  const depth = street.currentDepthCm || 0;

  // Determine trend from forecast
  const stepNow = street.forecast.find((f) => f.timeOffsetMin === 0)?.predictedDepthCm ?? depth;
  const step30 = street.forecast.find((f) => f.timeOffsetMin === 30)?.predictedDepthCm ?? depth;
  const delta = Math.round((step30 - stepNow) * 10) / 10;

  let trendIcon = <Minus className="w-4 h-4 text-slate-400" />;
  let trendLabel = '► Stable at Peak';
  let trendClass = 'text-slate-300 bg-slate-800 border-slate-700';

  if (delta > 2) {
    trendIcon = <TrendingUp className="w-4 h-4 text-rose-400" />;
    trendLabel = `▲ Rising (+${delta} cm next 30 min)`;
    trendClass = 'text-rose-300 bg-rose-950/80 border-rose-800';
  } else if (delta < -2) {
    trendIcon = <TrendingDown className="w-4 h-4 text-emerald-400" />;
    trendLabel = `▼ Receding (${delta} cm next 30 min)`;
    trendClass = 'text-emerald-300 bg-emerald-950/80 border-emerald-800';
  }

  // Realistic Mumbai alternate routes tailored to each known spot
  const getSafeAlternateAdvice = (streetId: string, streetName: string): { alternate: string; reason: string } => {
    switch (streetId) {
      case 'mum_milan_subway':
        return {
          alternate: 'Divert via Vile Parle East Flyover & S.V. Road elevated flyover link.',
          reason: 'Milan Subway underpass is submerged under 145 cm of standing runoff. High water level triggers engine stall.'
        };
      case 'mum_hindmata':
        return {
          alternate: 'Use the Dr. B.A. Road Elevated Hindmata Flyover or Lalbaug Flyover.',
          reason: 'Surface carriageway below flyover is flooded. Elevated flyover has 0 cm water and is 100% passable.'
        };
      case 'mum_andheri_subway':
        return {
          alternate: 'Use Gokhale Bridge (reopened link) or Balasaheb Thackeray Flyover (Jogeshwari).',
          reason: 'Andheri Subway is closed to all vehicular traffic due to low depression sump overload.'
        };
      case 'mum_gandhi_market':
        return {
          alternate: 'Take Eastern Express Highway via Sion Flyover or Bhau Daji Road.',
          reason: 'Kingsway surface water accumulation of 84 cm blocks low-chassis vehicles.'
        };
      case 'mum_kings_circle':
        return {
          alternate: 'Divert via Tulpule Flyover (Sion) or Matunga Central Station flyover bypass.',
          reason: 'Maheshwari Udyan circle suffers from sluggish storm drain discharge into Mahim Creek.'
        };
      case 'mum_lbs_kurla':
        return {
          alternate: 'Divert via Santacruz-Chembur Link Road (SCLR) elevated corridor or BKC Main Connector.',
          reason: 'Mithi River high tide backflow has saturated Kamani culverts, leading to 68 cm surface ponding.'
        };
      case 'mum_sion_circle':
        return {
          alternate: 'Utilize Eastern Freeway or Sion-Trombay elevated ramp.',
          reason: 'Sion Circle depression holds 52 cm water. Slow-moving traffic; heavy vehicles only.'
        };
      case 'mum_chembur':
        return {
          alternate: 'Bypass via Eastern Freeway (Chembur Exit) or RC Marg monorail corridor.',
          reason: 'Postal Colony low-lying junction experiencing 38 cm runoff accumulation.'
        };
      case 'mum_dadar_tt':
        return {
          alternate: 'Use Tilak Bridge Elevated Link or Senapati Bapat Marg.',
          reason: 'Moderate 18 cm puddle accumulation near circle. Passable with reduced speed.'
        };
      default:
        return {
          alternate: 'Reroute via closest elevated arterial flyover or ring road.',
          reason: 'Active surface ponding detected. Bypass recommended to avoid unexpected traffic queues.'
        };
    }
  };

  const advice = getSafeAlternateAdvice(street.id, street.name);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:static md:z-auto animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-slate-900 border-t-2 md:border md:rounded-2xl border-slate-700 shadow-2xl p-5 md:p-6 text-slate-100 max-w-2xl mx-auto md:max-w-none w-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${depth >= 30 ? 'bg-rose-500 animate-pulse' : 'bg-orange-500'}`}></span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {street.neighborhood}
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-white mt-0.5 tracking-tight">
              {street.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
          {/* Water Depth */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Estimated Depth
            </span>
            <div className="text-3xl font-black text-white font-mono mt-0.5">
              {depth} <span className="text-sm font-semibold text-slate-400">cm</span>
            </div>
            <span className="text-[10px] text-cyan-400 font-medium block">
              Estimated depth
            </span>
            <span className={`text-[11px] font-bold mt-1 inline-block ${depth >= 30 ? 'text-rose-400' : depth >= 15 ? 'text-orange-400' : depth >= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {depth >= 30 ? 'Severe Submersion' : depth >= 15 ? 'High Accumulation' : depth >= 5 ? 'Moderate Inundation' : 'Passable / Dry'}
            </span>
          </div>

          {/* Inundation Trend */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              30-Min Trend
            </span>
            <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 w-fit my-1 ${trendClass}`}>
              {trendIcon}
              <span>{trendLabel}</span>
            </div>
            <span className="text-[10px] text-slate-400">Hydrological nowcast</span>
          </div>

          {/* Vehicle Stall Status */}
          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Vehicle Stall Risk
            </span>
            <div className="text-sm font-extrabold text-white flex items-center gap-1.5 my-1">
              <Car className="w-4 h-4 text-rose-400 shrink-0" />
              <span className={depth >= 30 ? 'text-rose-400 font-black' : 'text-orange-400'}>
                {depth >= 30 ? '100% (CLOSED)' : depth >= 15 ? 'High Risk (>15 cm)' : 'Passable Slow'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              {depth >= 30 ? 'Engine hydro-lock imminent' : 'Avoid low-ground clearance cars'}
            </span>
          </div>
        </div>

        {/* Hazard & Alternate Advice Box */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 mb-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white block font-semibold mb-0.5">Hazard Assessment:</strong>
              {advice.reason}
            </p>
          </div>

          <div className="flex items-start gap-2.5 pt-2 border-t border-slate-800/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-200 leading-relaxed font-medium">
              <strong className="text-white block font-semibold mb-0.5">Recommended Safe Bypass:</strong>
              {advice.alternate}
            </p>
          </div>
        </div>

        {/* Action Button: Route Around Area */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => onNavigateAround(street)}
            className="w-full sm:flex-1 min-h-[48px] px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer uppercase tracking-wider"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Plan a trip</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto min-h-[48px] px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
          >
            <span>Dismiss</span>
          </button>
        </div>
      </div>
    </div>
  );
};
