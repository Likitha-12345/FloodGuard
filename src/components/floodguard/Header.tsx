import React from 'react';
import {
  ShieldAlert,
  Globe2,
  Clock,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Sparkles,
  Siren,
  ChevronDown
} from 'lucide-react';
import { TRANSLATIONS } from '../../data/mumbaiFloodConstants';

interface HeaderProps {
  language: 'en' | 'hi' | 'mr';
  onLanguageChange: (lang: 'en' | 'hi' | 'mr') => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  emergencyMode: boolean;
  onToggleEmergencyMode: () => void;
  lastUpdatedText: string;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  isHighContrast,
  onToggleHighContrast,
  isOffline,
  onToggleOffline,
  emergencyMode,
  onToggleEmergencyMode,
  lastUpdatedText
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 bg-[#0B1220]/95 backdrop-blur-md border-b border-[#1E2D4A] select-none">
      {/* Offline Banner if Active */}
      {isOffline && (
        <div className="bg-[#FFA940]/15 border-b border-[#FFA940]/40 px-4 py-1.5 text-xs text-[#FFA940] flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Showing last saved radar & hydrological observation • Offline Mode</span>
          </div>
          <button
            onClick={onToggleOffline}
            className="underline hover:text-white cursor-pointer font-bold"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand & City */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#1E40AF] shadow-md shadow-[#38BDF8]/20 shrink-0">
            <ShieldAlert className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4D4F] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF4D4F]"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                FloodGuard
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#111A2E] text-[#38BDF8] border border-[#1E2D4A]">
                Mumbai
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse"></span>
                <span className="text-[#2ECC71] font-semibold">Live Data</span>
              </span>
              <span>•</span>
              <span className="tabular-nums font-mono">{lastUpdatedText}</span>
            </div>
          </div>
        </div>

        {/* Right Tools: Emergency Mode, Language, Contrast, Offline Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Emergency Mode Toggle */}
          <button
            onClick={onToggleEmergencyMode}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              emergencyMode
                ? 'bg-[#FF4D4F] text-white border-[#FF4D4F] shadow-lg shadow-[#FF4D4F]/30 animate-pulse'
                : 'bg-[#111A2E] text-slate-300 border-[#1E2D4A] hover:text-white hover:border-slate-600'
            }`}
            title="Emergency responder prioritization for open hospital corridors"
          >
            <Siren className={`w-3.5 h-3.5 ${emergencyMode ? 'text-white' : 'text-[#FF4D4F]'}`} />
            <span className="hidden sm:inline">
              {emergencyMode ? 'Emergency Active' : t.emergencyMode}
            </span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-[#111A2E] rounded-xl border border-[#1E2D4A] p-0.5 text-xs font-medium">
            {(['en', 'hi', 'mr'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  language === lang
                    ? 'bg-[#38BDF8] text-[#0B1220] font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
              </button>
            ))}
          </div>

          {/* High Contrast / Dark Toggle */}
          <button
            onClick={onToggleHighContrast}
            className="p-2 rounded-xl bg-[#111A2E] hover:bg-slate-800 text-slate-400 hover:text-white border border-[#1E2D4A] transition-colors cursor-pointer"
            title="Toggle High-Contrast Sunlight Mode"
          >
            {isHighContrast ? <Sun className="w-4 h-4 text-[#FFA940]" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
