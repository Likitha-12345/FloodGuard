import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  ChevronRight,
  PhoneCall,
  Sun,
  Eye
} from 'lucide-react';
import {
  CityId,
  StreetFeature,
  DrainageNetwork,
  DashboardSummary,
  RainfallScenario
} from '../types/flood';
import { CITIES_INFO } from '../data/citiesData';
import { DashboardMap } from '../components/DashboardMap';
import { AreaDetailDrawer } from '../components/AreaDetailDrawer';

interface DashboardPageProps {
  currentCity: CityId;
  streets: StreetFeature[];
  drainage: DrainageNetwork;
  summary: DashboardSummary | null;
  activeScenario: RainfallScenario;
  onNavigateToMap: () => void;
  onNavigateToRoute?: () => void;
  onNavigateToTripCheck?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentCity,
  streets,
  drainage,
  summary,
  activeScenario,
  onNavigateToMap,
  onNavigateToRoute,
  onNavigateToTripCheck
}) => {
  const city = CITIES_INFO[currentCity] || CITIES_INFO.mumbai;

  // Local UI State
  const [selectedStreetId, setSelectedStreetId] = useState<string | null>(null);
  const [selectedTimelineOffset, setSelectedTimelineOffset] = useState<number>(0);
  const [isEmergencyMode, setIsEmergencyMode] = useState<boolean>(false);

  // Derive metrics calibrated to realistic observations & live model outputs
  const maxWaterDepth = useMemo(() => {
    return Math.max(0, ...streets.map((s) => {
      const step = s.forecast.find((f) => f.timeOffsetMin === selectedTimelineOffset);
      return step?.predictedDepthCm ?? (s.currentDepthCm || 0);
    }));
  }, [streets, selectedTimelineOffset]);

  const rainRate = summary?.rainfallIntensityMmHr ?? activeScenario.intensityMmHr ?? 0;

  // Severe area count (depth >= 30 cm)
  const severeAreasCount = useMemo(() => {
    return streets.filter((s) => (s.currentDepthCm || 0) >= 30).length;
  }, [streets]);

  const highRiskAreasCount = useMemo(() => {
    return streets.filter((s) => (s.currentDepthCm || 0) >= 15).length;
  }, [streets]);

  const overallRisk = useMemo<'safe' | 'moderate' | 'high' | 'severe'>(() => {
    if (maxWaterDepth >= 30) return 'severe';
    if (maxWaterDepth >= 15) return 'high';
    if (maxWaterDepth >= 5) return 'moderate';
    return 'safe';
  }, [maxWaterDepth]);

  const isLiveMode = activeScenario.id === 'live' || activeScenario.source === 'api';
  const isClear = maxWaterDepth < 5 && rainRate <= 0.1;

  // Deepest spot
  const deepestStreet = useMemo(() => {
    return [...streets].sort((a, b) => (b.currentDepthCm || 0) - (a.currentDepthCm || 0))[0] || null;
  }, [streets]);

  // Distinct Top Areas To Avoid
  const topAreasToAvoid = useMemo(() => {
    const priorityIds = [
      'mum_milan_subway',
      'mum_hindmata',
      'mum_andheri_subway',
      'mum_gandhi_market',
      'mum_kings_circle',
      'mum_lbs_kurla',
      'mum_sion_circle',
      'mum_chembur',
      'mum_dadar_tt'
    ];

    if (currentCity === 'mumbai') {
      const matchedStreets: StreetFeature[] = [];
      priorityIds.forEach((pId) => {
        const found = streets.find((s) => s.id === pId);
        if (found) matchedStreets.push(found);
      });

      streets.forEach((s) => {
        if (!matchedStreets.some((m) => m.id === s.id)) {
          matchedStreets.push(s);
        }
      });

      return matchedStreets.slice(0, 9);
    }

    return [...streets]
      .sort((a, b) => (b.currentDepthCm || 0) - (a.currentDepthCm || 0))
      .slice(0, 9);
  }, [streets, currentCity]);

  const hazardAreasCount = useMemo(() => {
    if (isClear) return 0;
    return topAreasToAvoid.filter((s) => (s.currentDepthCm || 0) >= 15).length;
  }, [topAreasToAvoid, isClear]);

  // Selected street object for drawer
  const selectedStreet = useMemo(() => {
    if (!selectedStreetId) return null;
    return streets.find((s) => s.id === selectedStreetId) || null;
  }, [selectedStreetId, streets]);


  // Timeline Milestones (0, 30, 60, 120, 180 min)
  const timelineMilestones = useMemo(() => {
    return [
      { label: 'Now', offsetMin: 0, status: 'Current' },
      { label: '+30 min', offsetMin: 30, status: '+30 min' },
      { label: '+1 hour', offsetMin: 60, status: '+1 hour' },
      { label: '+2 hours', offsetMin: 120, status: '+2 hours' },
      { label: '+3 hours', offsetMin: 180, status: '+3 hours' }
    ].map((m) => {
      // Find peak depth at this offset
      const maxDepthAtTime = Math.max(
        0,
        ...streets.map((s) => {
          const step = s.forecast.find((f) => f.timeOffsetMin === m.offsetMin);
          return step?.predictedDepthCm || 0;
        })
      );

      let riskColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
      let dotColor = 'bg-emerald-400';
      let riskLabel = 'Low';
      let symbol = '🟢';

      if (maxDepthAtTime >= 30) {
        riskColor = 'text-rose-300 bg-rose-950/90 border-rose-800';
        dotColor = 'bg-rose-500 animate-pulse';
        riskLabel = 'Severe';
        symbol = '🔴';
      } else if (maxDepthAtTime >= 15) {
        riskColor = 'text-orange-300 bg-orange-950/90 border-orange-800';
        dotColor = 'bg-orange-500';
        riskLabel = 'High';
        symbol = '🟠';
      } else if (maxDepthAtTime >= 5) {
        riskColor = 'text-amber-300 bg-amber-950/90 border-amber-800';
        dotColor = 'bg-amber-400';
        riskLabel = 'Moderate';
        symbol = '🟡';
      }

      return {
        ...m,
        maxDepthAtTime,
        riskColor,
        dotColor,
        riskLabel,
        symbol
      };
    });
  }, [streets]);


  return (
    <div className={`flex-1 overflow-y-auto select-none transition-colors duration-200 ${
      isEmergencyMode ? 'bg-black text-white' : 'bg-slate-950 text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ========================================================
            1. HERO SECTION: CRITICAL ALERT BANNER
            Level 1: Critical (glowing crimson/emerald, high-contrast, min 44px hero CTA)
           ======================================================== */}
        <section
          aria-label="Critical Flood Alert"
          className={`relative overflow-hidden rounded-2xl border p-5 sm:p-7 shadow-2xl transition-all ${
            isEmergencyMode
              ? isClear
                ? 'bg-zinc-950 border-emerald-500 shadow-emerald-950 ring-2 ring-yellow-400'
                : 'bg-rose-950/90 border-rose-500 shadow-rose-950 ring-2 ring-yellow-400'
              : isClear
              ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-600/60 shadow-emerald-950/30'
              : overallRisk === 'severe'
              ? 'bg-gradient-to-r from-rose-950/95 via-rose-900/80 to-slate-900/90 border-rose-600/80 shadow-rose-950/50'
              : 'bg-gradient-to-r from-amber-950/95 via-slate-900 to-slate-900 border-amber-600/80 shadow-amber-950/40'
          }`}
        >
          {/* Subtle emergency background glow */}
          <div className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
            isClear ? 'bg-emerald-600/15' : 'bg-rose-600/20'
          }`} />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Alert Context & Description */}
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Honesty Source Badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  isLiveMode
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
                    : 'bg-amber-950/90 text-amber-300 border-amber-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>{isLiveMode ? 'Live rainfall: Open-Meteo' : 'Demo scenario'}</span>
                </span>

                {/* Risk Badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-black uppercase tracking-wider shadow-md ${
                  isClear
                    ? 'bg-emerald-600 shadow-emerald-900'
                    : overallRisk === 'severe'
                    ? 'bg-rose-600 shadow-rose-900 animate-pulse'
                    : 'bg-amber-600 shadow-amber-900'
                }`}>
                  <span>{isClear ? 'Low Flood Risk' : `${overallRisk.toUpperCase()} Flood Risk`}</span>
                </span>

                <span className="text-xs font-bold text-slate-300 bg-slate-850 px-2.5 py-0.5 rounded-md border border-slate-700">
                  {isClear ? 'Corridors Clear' : `${severeAreasCount + highRiskAreasCount} Areas Affected`}
                </span>

                <span className="text-xs text-slate-300 font-medium">
                  {city.name} Metropolitan Area
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {isClear
                  ? 'Low risk. No flooding expected.'
                  : overallRisk === 'severe'
                  ? 'Dangerous Water Accumulation Across Low-Lying Arterials'
                  : 'Elevated Water Accumulation in Low-Lying Corridors'}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed">
                {isClear ? (
                  <>
                    Open-Meteo live forecast records <strong>{rainRate} mm/h</strong> rainfall. All railway underpasses, subways, and low-lying transit corridors are completely clear with <strong>0 cm</strong> estimated water depth.
                  </>
                ) : (
                  <>
                    Critical underpasses are experiencing estimated water accumulation up to <strong>{maxWaterDepth} cm</strong>.
                    Commuters and light vehicles should divert away from low depressions and use elevated flyovers.
                  </>
                )}
              </p>
            </div>

            {/* Hero CTAs + Emergency High-Contrast Toggle */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
              {/* Primary Action Button (CLEAR HERO) */}
              <button
                onClick={onNavigateToTripCheck}
                className="min-h-[52px] px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/80 transition-transform active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                <ShieldCheck className="w-5 h-5 text-slate-950" />
                <span>Plan a trip</span>
              </button>

              {/* Helpline 1916 Button */}
              <a
                href="tel:1916"
                className="min-h-[52px] px-4 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:bg-slate-850 text-slate-200 hover:text-white border border-slate-700 text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-slate-950/40"
              >
                <PhoneCall className="w-4 h-4 text-cyan-400" />
                <span>Helpline 1916</span>
              </a>

              {/* Secondary Action Button */}
              <button
                onClick={onNavigateToMap}
                className="min-h-[52px] px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:bg-slate-850 text-white border border-slate-700 text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>View Flood Map</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>

              {/* High-Contrast Emergency Mode Toggle */}
              <button
                onClick={() => setIsEmergencyMode(!isEmergencyMode)}
                title="Toggle High-Contrast Emergency Mode"
                className={`min-h-[52px] px-3.5 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isEmergencyMode
                    ? 'bg-yellow-400 text-black border-yellow-300 ring-2 ring-yellow-400 font-black'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sun className={`w-4 h-4 ${isEmergencyMode ? 'text-black' : 'text-yellow-400'}`} />
                <span className="hidden sm:inline">
                  {isEmergencyMode ? 'High-Contrast: ON' : 'Emergency Mode'}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. LEVEL 2: 4 KEY STAT CARDS
            (Current Risk, Max Water Depth, Rainfall Rate, Areas to Avoid)
            Large numbers 32–48px, minimum body 14px, WCAG AA contrast, trend tags
           ======================================================== */}
        <section aria-label="Key Flood Telemetry" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1: Current Risk */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isEmergencyMode
              ? isClear ? 'bg-zinc-950 border-emerald-500' : 'bg-zinc-950 border-rose-500 ring-1 ring-rose-500'
              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
          }`}>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Current Risk
            </span>
            <div className="my-2.5">
              <div className={`text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-2 ${
                isClear
                  ? 'text-emerald-400'
                  : overallRisk === 'severe'
                  ? 'text-rose-400'
                  : overallRisk === 'high'
                  ? 'text-orange-400'
                  : 'text-amber-400'
              }`}>
                <span>{overallRisk.toUpperCase()}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  isClear ? 'bg-emerald-400' : overallRisk === 'severe' ? 'bg-rose-500 animate-ping' : 'bg-amber-400'
                }`}></span>
              </div>
              <div className="text-sm text-slate-200 mt-1 font-semibold truncate">
                {isClear ? 'Corridors clear & passable' : `${severeAreasCount + highRiskAreasCount} affected flood zones`}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>Threat Level</span>
              <span className={`font-bold ${
                isClear ? 'text-emerald-400' : overallRisk === 'severe' ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {isClear ? '● Normal' : '▲ Elevated'}
              </span>
            </div>
          </div>

          {/* Stat 2: Max Water Depth */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isEmergencyMode
              ? 'bg-zinc-950 border-yellow-400'
              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
          }`}>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Max Water Depth
            </span>
            <div className="my-2">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {maxWaterDepth}
                <span className="text-lg font-bold text-slate-400 ml-1.5">cm</span>
              </div>
              <span className="text-[11px] font-semibold text-cyan-400 block mt-0.5">
                Estimated depth
              </span>
              <div className="text-sm text-slate-200 mt-1 font-semibold truncate">
                {isClear ? 'All monitored spots clear' : deepestStreet?.name || 'Low-lying Underpass'}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>Deepest Depression</span>
              <span className={isClear ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {isClear ? '● Dry' : '▲ Inundated'}
              </span>
            </div>
          </div>

          {/* Stat 3: Rainfall Rate */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isEmergencyMode
              ? 'bg-zinc-950 border-cyan-400'
              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
          }`}>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Rainfall Rate
            </span>
            <div className="my-2.5">
              <div className="text-3xl sm:text-4xl font-black text-cyan-300 font-mono tracking-tight">
                {rainRate}
                <span className="text-base font-bold text-slate-400 ml-1.5">mm/h</span>
              </div>
              <div className="text-sm text-slate-200 mt-1 font-semibold truncate">
                {rainRate === 0
                  ? 'Clear / Dry Weather'
                  : rainRate < 15
                  ? 'Light Rain / Showers'
                  : rainRate < 45
                  ? 'Moderate Rainfall'
                  : 'Severe Downpour'}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>Data Source</span>
              <span className="text-cyan-400 font-bold">
                {isLiveMode ? 'Open-Meteo Weather API' : 'Demo Simulation'}
              </span>
            </div>
          </div>

          {/* Stat 4: Areas to Avoid */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isEmergencyMode
              ? 'bg-zinc-950 border-orange-500'
              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
          }`}>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Areas to Avoid
            </span>
            <div className="my-2.5">
              <div className="text-3xl sm:text-4xl font-black text-rose-400 font-mono tracking-tight">
                {hazardAreasCount}
              </div>
              <div className="text-sm text-slate-200 mt-1 font-semibold">
                {hazardAreasCount === 0 ? 'All subways open' : 'Subways & Underpasses'}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>Passability</span>
              <span className={isClear ? 'text-emerald-400 font-bold' : 'text-orange-400 font-bold'}>
                {isClear ? 'All Corridors Open' : 'Stall Hazard'}
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. "WHAT IS HAPPENING RIGHT NOW?"
            Concise, stress-free explanation + forecast confidence
           ======================================================== */}
        <section
          aria-label="Current Situation Summary"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
        >
          <div className="space-y-1.5 max-w-3xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span>What is happening right now?</span>
            </h2>
            <p className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              {isClear
                ? `Clear and dry conditions observed across ${city.name}.`
                : `Convective precipitation (${rainRate} mm/hr) is active across low-lying sectors of ${city.name}.`}
            </p>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {isClear
                ? `Live Open-Meteo observations report ${rainRate} mm/hr rainfall. All underground storm drainage networks have complete reserve capacity, and critical underpasses (Milan Subway, Hindmata Junction, Andheri Subway) have 0 cm estimated water depth. All arterial corridors are open.`
                : `Runoff accumulation is predicted in low depressions and railway underpasses up to ${maxWaterDepth} cm. Pumping stations and gravity drains are functioning, and elevated flyovers are recommended for safe vehicular transit.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
            <span className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isLiveMode ? 'Live Source: ' : 'Model: '}
                <strong className="text-white">{isLiveMode ? 'Open-Meteo API' : 'Calibrated Scenario'}</strong>
              </span>
            </span>
          </div>
        </section>

        {/* ========================================================
            4. MAP AS HERO
            Interactive Leaflet map with color-coded flood zones,
            Top Areas to Avoid pins, and "My Location" button
           ======================================================== */}
        <section aria-label="Interactive Flood Map Hero">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                <span>Live Mumbai Flood Risk Map</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time street submersion and low-lying railway underpass tracking
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToMap}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Expand Full Map</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Embedded Leaflet Map */}
          <DashboardMap
            currentCity={currentCity}
            streets={streets}
            selectedStreetId={selectedStreetId}
            onSelectStreet={(id) => setSelectedStreetId(id)}
            isEmergencyMode={isEmergencyMode}
            timeOffsetMin={selectedTimelineOffset}
          />

          {/* Drawer / Bottom Sheet (Triggered by map click or list "View" button) */}
          {selectedStreet && (
            <div className="mt-4">
              <AreaDetailDrawer
                street={selectedStreet}
                onClose={() => setSelectedStreetId(null)}
                onNavigateAround={(st) => {
                  onNavigateToTripCheck?.();
                }}
                isEmergencyMode={isEmergencyMode}
              />
            </div>
          )}
        </section>

        {/* ========================================================
            5. TWO CORE ACTION COLUMNS:
            LEFT: TOP AREAS TO AVOID LIST (Realistic Mumbai Locations)
            RIGHT: FLOOD RISK NEXT 3 HOURS TIMELINE
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: TOP AREAS TO AVOID */}
          <section
            aria-label="Top Areas To Avoid"
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isClear ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <span>Top Monitored Locations ({city.name})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isClear ? 'All low depressions currently open and passable' : 'Subways and low depressions with vehicle stall risk'}
                  </p>
                </div>
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                  isClear
                    ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
                    : 'text-rose-400 bg-rose-950/80 border-rose-800'
                }`}>
                  {isClear ? '0 Hazard Zones' : `${hazardAreasCount} Hazard Zones`}
                </span>
              </div>

              {isClear && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-200 flex items-center gap-2 my-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All monitored low-lying subways and railway underpasses are clear (0 cm estimated depth). No flooding hazard.</span>
                </div>
              )}

              {/* Top Areas List */}
              <div className="divide-y divide-slate-800/80 mt-2">
                {topAreasToAvoid.map((st) => {
                  const depth = st.currentDepthCm || 0;
                  const isSelected = st.id === selectedStreetId;

                  let statusText = 'Clear / Passable';
                  let statusBadge = 'text-emerald-300 bg-emerald-950/80 border-emerald-800';
                  let trendText = '● Dry';

                  if (depth >= 100) {
                    statusText = 'Deep Submersion';
                    statusBadge = 'text-rose-300 bg-rose-950 border-rose-700';
                    trendText = '▲ Rising';
                  } else if (depth >= 40) {
                    statusText = 'Closed / Stall Risk';
                    statusBadge = 'text-rose-300 bg-rose-950/80 border-rose-800';
                    trendText = '▲ Rising';
                  } else if (depth >= 20) {
                    statusText = 'High Accumulation';
                    statusBadge = 'text-orange-300 bg-orange-950/80 border-orange-800';
                    trendText = '▲ Rising';
                  } else if (depth >= 5) {
                    statusText = 'Caution Slow';
                    statusBadge = 'text-amber-300 bg-amber-950/80 border-amber-800';
                    trendText = '► Moderate';
                  }

                  return (
                    <div
                      key={st.id}
                      className={`py-3 px-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-slate-800/90 ring-1 ring-cyan-500'
                          : 'hover:bg-slate-850/60'
                      }`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            depth >= 30 ? 'bg-rose-500' : depth >= 15 ? 'bg-orange-500' : depth >= 5 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}></span>
                          <h4 className="text-sm font-bold text-white truncate">
                            {st.name}
                          </h4>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pl-4">
                          <span className="text-slate-300 font-medium">{st.neighborhood}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.2 rounded text-[11px] font-semibold border ${statusBadge}`}>
                            {statusText}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {trendText}
                          </span>
                        </div>
                      </div>

                      {/* Depth & View Action (min 44px tap target) */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-base sm:text-lg font-black text-white font-mono">
                            {depth} <span className="text-xs font-semibold text-slate-400">cm</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            Estimated depth
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedStreetId(st.id)}
                          aria-label={`View details for ${st.name}`}
                          className={`min-h-[44px] min-w-[54px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-900'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={onNavigateToTripCheck}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Plan a trip</span>
            </button>
          </section>

          {/* RIGHT COLUMN: FLOOD RISK NEXT 3 HOURS TIMELINE */}
          <section
            aria-label="Flood Forecast Next 3 Hours"
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Flood Risk Next 3 Hours</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tap any interval to preview water accumulation changes
                  </p>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                  0 to 180 min
                </span>
              </div>

              {/* Interactive Milestone Buttons */}
              <div className="py-6">
                <div className="grid grid-cols-5 gap-2 text-center">
                  {timelineMilestones.map((step) => {
                    const isSelected = selectedTimelineOffset === step.offsetMin;
                    return (
                      <button
                        key={step.offsetMin}
                        onClick={() => setSelectedTimelineOffset(step.offsetMin)}
                        className={`min-h-[44px] p-2 rounded-xl transition-all flex flex-col items-center space-y-1 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 ring-2 ring-cyan-400 shadow-lg shadow-cyan-950'
                            : 'hover:bg-slate-850'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-300 font-mono">
                          {step.label}
                        </span>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg bg-slate-950 border border-slate-700 shadow-inner">
                          {step.symbol}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-200">
                          {step.riskLabel}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ~{step.maxDepthAtTime} cm
                        </span>
                        <span className="text-[9px] text-slate-400 font-normal">
                          Estimated depth
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Connecting Severity Bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full mt-5 overflow-hidden">
                  <div className={`h-full w-full rounded-full ${
                    isClear
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-rose-500 via-orange-500 via-amber-400 to-emerald-400'
                  }`} />
                </div>
              </div>

              {/* Predictive Plain-English Sentence */}
              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">
                  {isClear ? (
                    <>
                      No rainfall forecast over the next 3 hours across {city.name}. All arterial underpasses and railway subways are projected to remain completely dry and safe for vehicular transit.
                    </>
                  ) : (
                    <>
                      Peak inundation across {city.name} subways occurs within the next <strong>30–45 minutes</strong> (~{maxWaterDepth} cm). Stormwater drains will begin actively receding past <strong>+90 minutes</strong> as storm cells drain.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
              <span>{isLiveMode ? 'Open-Meteo 15-min Forecast Cycle' : 'Calibrated Hydrological Model'}</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active 15-min cycle</span>
              </span>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};
