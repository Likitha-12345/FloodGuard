import React from 'react';
import {
  CheckCircle2,
  Clock,
  Gauge,
  Droplets,
  Waves,
  ShieldCheck
} from 'lucide-react';
import { LanguageStrings } from '../../data/mumbaiFloodConstants';

interface SummarySectionProps {
  t: LanguageStrings;
  confidencePercent?: number;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  t,
  confidencePercent = 91.4
}) => {
  return (
    <section className="bg-[#111A2E] border border-[#1E2D4A] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Title & Confidence Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2D4A]">
        <div>
          <span className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider block">
            SITUATION BRIEFING
          </span>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
            {t.whatIsHappening}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Forecast Confidence: High ({confidencePercent}%)</span>
          </span>
        </div>
      </div>

      {/* 3 Clear Plain English Points */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <div className="p-4 rounded-xl bg-[#0B1220]/60 border border-[#1E2D4A]/80 space-y-2">
          <div className="flex items-center gap-2 text-[#38BDF8] font-bold text-sm">
            <Droplets className="w-4 h-4" />
            <span>Heavy Rainfall Inflow</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Intense cloudburst rainfall (58.5 mm/hr) is causing rapid surface water accumulation across low-lying underpasses and arterial subways.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1220]/60 border border-[#1E2D4A]/80 space-y-2">
          <div className="flex items-center gap-2 text-[#FFA940] font-bold text-sm">
            <Gauge className="w-4 h-4" />
            <span>Drainage Operating at Limit</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Municipal dewatering holding tanks at Hindmata and King’s Circle are above 90% capacity. Mithi river tidal backflow is slowing gravity discharge.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1220]/60 border border-[#1E2D4A]/80 space-y-2">
          <div className="flex items-center gap-2 text-[#FF4D4F] font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>Expected 45-Min Peak</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Flooding will reach maximum depth over the next 30 to 45 minutes before gradually receding as storm intensity tapers off after 1 hour.
          </p>
        </div>
      </div>
    </section>
  );
};
