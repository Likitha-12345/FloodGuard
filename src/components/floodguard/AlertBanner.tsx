import React, { useState } from 'react';
import {
  AlertTriangle,
  Navigation,
  Map,
  Share2,
  Check,
  ArrowRight,
  ShieldAlert,
  Flame,
  Radio
} from 'lucide-react';
import { LanguageStrings } from '../../data/mumbaiFloodConstants';

interface AlertBannerProps {
  t: LanguageStrings;
  affectedCount: number;
  onFindSafeRoute: () => void;
  onViewMap: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  t,
  affectedCount,
  onFindSafeRoute,
  onViewMap
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = `🚨 FloodGuard Mumbai Alert: Severe flood risk active. ${affectedCount} areas inundated (Hindmata, Milan Subway, Andheri Subway). Check safe routes: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({
        title: 'FloodGuard Mumbai Alert',
        text,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#FF4D4F] bg-gradient-to-br from-[#FF4D4F]/20 via-[#111A2E]/90 to-[#0B1220] p-5 sm:p-7 shadow-[0_0_35px_rgba(255,77,79,0.22)] backdrop-blur-xl">
      {/* Subtle background red glow pulse */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#FF4D4F]/15 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Headline & Details */}
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FF4D4F] text-white shadow-md shadow-[#FF4D4F]/30">
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
              <span>SEVERE FLOOD RISK</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#111A2E] text-rose-300 border border-[#FF4D4F]/40">
              {affectedCount} areas severely affected
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Mumbai Central & Western Suburbs
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            {t.alertTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
            {t.alertDesc}
          </p>
        </div>

        {/* Right CTA Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
          {/* Primary Hero CTA: Find Safe Route */}
          <button
            onClick={onFindSafeRoute}
            className="min-h-[48px] px-6 py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:from-[#27AE60] hover:to-[#219653] text-[#0B1220] font-black text-sm sm:text-base shadow-xl shadow-[#2ECC71]/30 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98] cursor-pointer"
          >
            <Navigation className="w-5 h-5 fill-[#0B1220]" />
            <span>{t.findSafeRoute}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary CTA: View Flood Map */}
          <button
            onClick={onViewMap}
            className="min-h-[48px] px-5 py-3.5 rounded-xl sm:rounded-2xl bg-[#111A2E] hover:bg-slate-800 text-white border border-[#1E2D4A] hover:border-slate-600 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Map className="w-4 h-4 text-[#38BDF8]" />
            <span>{t.viewMap}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="min-h-[48px] px-3.5 py-3.5 rounded-xl sm:rounded-2xl bg-[#111A2E]/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-[#1E2D4A] flex items-center justify-center gap-2 transition-all cursor-pointer"
            title="Share alert via WhatsApp or copy link"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#2ECC71]" />
                <span className="text-xs text-[#2ECC71] font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#FFA940]" />
                <span className="text-xs hidden sm:inline">{t.shareAlert}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
