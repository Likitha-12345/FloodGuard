import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Share2,
  Footprints,
  Bike,
  Car,
  Bus,
  Clock,
  ArrowRight,
  Check,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { CityId, StreetFeature, RainfallScenario } from '../types/flood';
import { CITIES_INFO } from '../data/citiesData';
import {
  TripVehicle,
  CityPlaceOption,
  TripAssessment,
  getTripPlacesForCity,
  calculateTripAssessment,
  formatTargetTime
} from '../data/tripCheckConstants';

interface TripCheckPageProps {
  currentCity: CityId;
  streets: StreetFeature[];
  activeScenario?: RainfallScenario;
  initialFrom?: string;
  initialTo?: string;
  initialVehicle?: TripVehicle;
}

export const TripCheckPage: React.FC<TripCheckPageProps> = ({
  currentCity,
  streets,
  activeScenario,
  initialFrom,
  initialTo,
  initialVehicle
}) => {
  const cityInfo = CITIES_INFO[currentCity] || CITIES_INFO.mumbai;
  const places = useMemo(() => getTripPlacesForCity(currentCity), [currentCity]);

  // Form Inputs
  const [fromPlaceId, setFromPlaceId] = useState<string>(() => {
    if (initialFrom) {
      const match = places.find(
        (p) => p.id === initialFrom || p.name.toLowerCase().includes(initialFrom.toLowerCase()) || initialFrom.toLowerCase().includes(p.name.toLowerCase())
      );
      if (match) return match.id;
    }
    return places[0]?.id || '';
  });

  const [toPlaceId, setToPlaceId] = useState<string>(() => {
    if (initialTo) {
      const match = places.find(
        (p) => p.id === initialTo || p.name.toLowerCase().includes(initialTo.toLowerCase()) || initialTo.toLowerCase().includes(p.name.toLowerCase())
      );
      if (match) return match.id;
    }
    return places[1]?.id || places[0]?.id || '';
  });

  const [vehicle, setVehicle] = useState<TripVehicle>(() => {
    if (initialVehicle) return initialVehicle;
    try {
      const saved = localStorage.getItem('floodguard_trip_vehicle');
      if (saved === 'walk' || saved === 'two_wheeler' || saved === 'car' || saved === 'bus') {
        return saved;
      }
      if (saved === 'walking') return 'walk';
      if (saved === 'two-wheeler') return 'two_wheeler';
    } catch {
      // Ignore localStorage errors
    }
    return 'car';
  });

  const [whenOffsetMin, setWhenOffsetMin] = useState<number>(0);

  // Result state
  const [assessment, setAssessment] = useState<TripAssessment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  // Sync place selection if city changes or prefilled from/to changes
  useEffect(() => {
    if (initialFrom) {
      const matchFrom = places.find(
        (p) => p.id === initialFrom || p.name.toLowerCase().includes(initialFrom.toLowerCase()) || initialFrom.toLowerCase().includes(p.name.toLowerCase())
      );
      if (matchFrom) setFromPlaceId(matchFrom.id);
    } else if (places.length >= 2 && !fromPlaceId) {
      setFromPlaceId(places[0].id);
    }

    if (initialTo) {
      const matchTo = places.find(
        (p) => p.id === initialTo || p.name.toLowerCase().includes(initialTo.toLowerCase()) || initialTo.toLowerCase().includes(p.name.toLowerCase())
      );
      if (matchTo) setToPlaceId(matchTo.id);
    } else if (places.length >= 2 && !toPlaceId) {
      setToPlaceId(places[1].id);
    }
  }, [currentCity, places, initialFrom, initialTo]);

  // Keep vehicle state synced with initialVehicle if it changes
  useEffect(() => {
    if (initialVehicle) {
      setVehicle(initialVehicle);
    }
  }, [initialVehicle]);

  const handleCheckTrip = () => {
    setErrorMessage(null);
    if (!fromPlaceId || !toPlaceId) {
      setErrorMessage('Please select both From and To locations.');
      return;
    }
    if (fromPlaceId === toPlaceId) {
      setErrorMessage('Please select different From and To locations.');
      return;
    }

    const fromPlace = places.find((p) => p.id === fromPlaceId);
    const toPlace = places.find((p) => p.id === toPlaceId);

    if (!fromPlace || !toPlace) {
      setErrorMessage('Selected locations could not be resolved.');
      return;
    }

    setIsLoading(true);

    // Short simulated delay for smooth feel and loading state verification
    setTimeout(() => {
      try {
        const result = calculateTripAssessment({
          cityId: currentCity,
          fromPlace,
          toPlace,
          vehicle,
          whenOffsetMin,
          streets,
          activeScenario
        });
        setAssessment(result);
      } catch (err) {
        setErrorMessage('Failed to evaluate trip safety. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 250);
  };

  const handleShare = () => {
    if (!assessment) return;

    const summaryText = `FloodGuard Trip Check for ${cityInfo.name}:
Verdict: ${assessment.verdict}
Trip: ${assessment.fromName} → ${assessment.toName}
Vehicle: ${assessment.vehicle.toUpperCase()}
When: ${assessment.whenLabel} (${formatTargetTime(assessment.whenOffsetMin)})
Reason: ${assessment.reason}
Best Time to Leave: ${assessment.bestWindowLabel}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } else {
      // Fallback
      window.prompt('Copy trip summary:', summaryText);
    }
  };

  const vehicleOptions: { id: TripVehicle; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'walk', label: 'Walk', icon: Footprints },
    { id: 'two_wheeler', label: 'Two-wheeler', icon: Bike },
    { id: 'car', label: 'Car', icon: Car },
    { id: 'bus', label: 'Bus', icon: Bus }
  ];

  const whenOptions: { offsetMin: number; label: string }[] = [
    { offsetMin: 0, label: 'Now' },
    { offsetMin: 60, label: 'In 1 hour' },
    { offsetMin: 120, label: 'In 2 hours' },
    { offsetMin: 180, label: 'In 3 hours' }
  ];

  // Group places for the select dropdowns
  const groupedPlaces = useMemo(() => {
    const groups: Record<string, CityPlaceOption[]> = {};
    places.forEach((p) => {
      if (!groups[p.group]) groups[p.group] = [];
      groups[p.group].push(p);
    });
    return groups;
  }, [places]);

  const isLive = activeScenario?.id === 'live' || activeScenario?.source === 'api';

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 select-none">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Trip Check
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isLive
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800'
              }`}>
                {isLive ? 'Live Open-Meteo' : 'Demo scenario'}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Check if your destination is safe from urban water accumulation in {cityInfo.name}
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-2 self-start sm:self-auto">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Telemetry: {activeScenario?.intensityMmHr || 0} mm/hr rain</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-sm flex items-center gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="from-select" className="text-sm font-bold text-slate-300 block">
                From
              </label>
              <select
                id="from-select"
                value={fromPlaceId}
                onChange={(e) => setFromPlaceId(e.target.value)}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-sm text-white font-medium focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
              >
                {Object.entries(groupedPlaces).map(([groupName, groupList]) => (
                  <optgroup key={groupName} label={groupName} className="bg-slate-900 text-slate-300 font-bold">
                    {groupList.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-850 text-white font-normal py-1">
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* To Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="to-select" className="text-sm font-bold text-slate-300 block">
                To
              </label>
              <select
                id="to-select"
                value={toPlaceId}
                onChange={(e) => setToPlaceId(e.target.value)}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-750 text-sm text-white font-medium focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
              >
                {Object.entries(groupedPlaces).map(([groupName, groupList]) => (
                  <optgroup key={groupName} label={groupName} className="bg-slate-900 text-slate-300 font-bold">
                    {groupList.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-850 text-white font-normal py-1">
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle Selector */}
          <div className="space-y-1.5">
            <span className="text-sm font-bold text-slate-300 block">
              Vehicle
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {vehicleOptions.map((v) => {
                const Icon = v.icon;
                const isSelected = vehicle === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVehicle(v.id)}
                    className={`min-h-[48px] px-3 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-950'
                        : 'bg-slate-850 text-slate-300 border-slate-750 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* When Selector */}
          <div className="space-y-1.5">
            <span className="text-sm font-bold text-slate-300 block">
              When
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {whenOptions.map((w) => {
                const isSelected = whenOffsetMin === w.offsetMin;
                return (
                  <button
                    key={w.offsetMin}
                    type="button"
                    onClick={() => setWhenOffsetMin(w.offsetMin)}
                    className={`min-h-[48px] px-3 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-950'
                        : 'bg-slate-850 text-slate-300 border-slate-750 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{w.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Big Check My Trip Button */}
          <button
            type="button"
            onClick={handleCheckTrip}
            disabled={isLoading}
            className="w-full min-h-[52px] px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:from-cyan-700 active:to-blue-700 disabled:opacity-50 text-white font-black text-base flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-950 cursor-pointer transition-transform active:scale-[0.99]"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Checking flood depth along trip...</span>
              </span>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-cyan-200" />
                <span>Check my trip</span>
              </>
            )}
          </button>
        </div>

        {/* 2. Result Card */}
        {assessment && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6">

            {/* A very large verdict badge with icon and color */}
            <div
              className={`p-6 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-5 transition-all ${
                assessment.verdict === 'GO'
                  ? 'bg-emerald-950/70 border-emerald-500 shadow-xl shadow-emerald-950/40 text-emerald-100'
                  : assessment.verdict === 'CAUTION'
                  ? 'bg-amber-950/70 border-amber-500 shadow-xl shadow-amber-950/40 text-amber-100'
                  : 'bg-rose-950/70 border-rose-500 shadow-xl shadow-rose-950/40 text-rose-100'
              }`}
            >
              <div className="flex items-center gap-4 text-center sm:text-left">
                {assessment.verdict === 'GO' && (
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/50">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                )}
                {assessment.verdict === 'CAUTION' && (
                  <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-900/50">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                )}
                {assessment.verdict === 'DONT_GO' && (
                  <div className="w-16 h-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-900/50">
                    <AlertOctagon className="w-10 h-10" />
                  </div>
                )}

                <div>
                  <div
                    className={`text-4xl sm:text-5xl font-black tracking-wider leading-none uppercase ${
                      assessment.verdict === 'GO'
                        ? 'text-emerald-300'
                        : assessment.verdict === 'CAUTION'
                        ? 'text-amber-300'
                        : 'text-rose-300'
                    }`}
                  >
                    {assessment.verdict === 'DONT_GO' ? "DON'T GO" : assessment.verdict}
                  </div>
                  <div className="text-xs font-semibold text-slate-300 mt-1 uppercase tracking-wider">
                    {assessment.vehicle.toUpperCase()} • {assessment.whenLabel.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Max depth summary pill */}
              <div className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-center shrink-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Max Estimated Depth
                </span>
                <span className="text-xl font-black text-white">
                  {assessment.maxEstimatedDepthCm} cm
                </span>
              </div>
            </div>

            {/* One line reason */}
            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Trip Assessment Reason
              </span>
              <p className="text-sm sm:text-base font-bold text-white truncate sm:whitespace-normal">
                {assessment.reason}
              </p>
            </div>

            {/* Risky spots on this trip (max 3) */}
            <div className="space-y-2.5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Risky Spots on this Trip (Max 3)</span>
                <span className="text-xs text-slate-400 lowercase font-medium">Estimated depth data</span>
              </h2>

              <div className="space-y-2">
                {assessment.riskySpots.length === 0 || assessment.maxEstimatedDepthCm === 0 ? (
                  <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750 flex items-center justify-between text-sm">
                    <span className="font-semibold text-white">All spots along trip corridor are clear</span>
                    <span className="px-3 py-1 rounded-lg text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Passable
                    </span>
                  </div>
                ) : (
                  assessment.riskySpots.map((spot) => (
                    <div
                      key={spot.id}
                      className="p-3.5 rounded-xl bg-slate-850 border border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-sm font-bold text-white">
                          {spot.name}
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5">
                          Estimated Depth: <strong className="text-white">{spot.estimatedDepthCm} cm</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs text-slate-400">
                          {vehicleOptions.find((v) => v.id === assessment.vehicle)?.label} access:
                        </span>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-black uppercase border ${
                            spot.canPass === 'Yes'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : spot.canPass === 'Caution'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-rose-950 text-rose-300 border-rose-800'
                          }`}
                        >
                          {spot.canPass === 'Yes' ? 'Passable' : spot.canPass === 'Caution' ? 'Caution' : 'Cannot pass'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Best time to leave: timeline of next 3 hours */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Best Time to Leave: <span className="text-cyan-400 font-extrabold">{assessment.bestWindowLabel}</span>
                </h2>
                <span className="text-xs text-slate-400">Next 3 hours</span>
              </div>

              {/* Timeline bar grid */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 space-y-3">
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {assessment.timeline.map((slot) => {
                    const isBest = slot.isBestWindow;
                    return (
                      <div
                        key={slot.timeOffsetMin}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${
                          isBest
                            ? 'bg-slate-800/90 border-cyan-400 shadow-md shadow-cyan-950/60 ring-1 ring-cyan-400'
                            : 'bg-slate-900/60 border-slate-800'
                        }`}
                      >
                        <span className={`text-[11px] font-bold ${isBest ? 'text-cyan-300' : 'text-slate-400'}`}>
                          {slot.timeLabel}
                        </span>

                        {/* Colored bar */}
                        <div
                          className={`w-full h-4 rounded-md transition-all ${
                            slot.verdict === 'GO'
                              ? 'bg-emerald-500'
                              : slot.verdict === 'CAUTION'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          title={`${slot.timeLabel}: ${slot.verdict} (${slot.maxDepthCm} cm estimated)`}
                        />

                        <span className="text-[10px] font-bold text-slate-300">
                          {slot.maxDepthCm} cm
                        </span>

                        {isBest && (
                          <span className="px-1 py-0.2 rounded text-[9px] font-black bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase tracking-tighter">
                            Best
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                    <span>GO (Passable)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                    <span>Caution</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                    <span>Don't Go</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Share & WhatsApp */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 active:bg-slate-850 text-white font-bold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {shareCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Copied to clipboard!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-cyan-400" />
                    <span>Share Trip Summary</span>
                  </>
                )}
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `FloodGuard Trip Check (${cityInfo.name}): ${assessment.verdict} for trip from ${assessment.fromName} to ${assessment.toName} via ${assessment.vehicle}. ${assessment.reason}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] px-6 py-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Share via WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
