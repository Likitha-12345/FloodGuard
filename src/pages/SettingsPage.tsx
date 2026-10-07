import React, { useState } from 'react';
import {
  Sliders,
  User,
  MapPin,
  Bell,
  ShieldCheck,
  Footprints,
  Bike,
  Bus,
  Monitor,
  Save,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  MessageSquare,
  Radio,
  Car,
  Home,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  Navigation
} from 'lucide-react';
import { CityId, RainfallScenario } from '../types/flood';
import { CITIES_INFO } from '../data/citiesData';
import { TripVehicle } from '../data/tripCheckConstants';

interface SettingsPageProps {
  currentCity: CityId;
  onCityChange?: (city: CityId) => void;
  activeScenario?: RainfallScenario;
}

interface SavedPlace {
  id: string;
  name: string;
  address: string;
  type: 'home' | 'work' | 'school' | 'other';
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentCity,
  onCityChange,
  activeScenario
}) => {
  // 1. Profile & Location
  const [homeCity, setHomeCity] = useState<CityId>(currentCity || 'mumbai');
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([
    { id: '1', name: 'Home', address: 'Dadar East, Dr. B.A. Road', type: 'home' },
    { id: '2', name: 'Work', address: 'Bandra-Kurla Complex (BKC)', type: 'work' },
    { id: '3', name: 'School', address: 'Matunga Central', type: 'school' }
  ]);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceAddress, setNewPlaceAddress] = useState('');
  const [newPlaceType, setNewPlaceType] = useState<'home' | 'work' | 'school' | 'other'>('home');
  const [isAddingPlace, setIsAddingPlace] = useState(false);

  // 2. Alerts
  const [severeFloodAlerts, setSevereFloodAlerts] = useState(true);
  const [heavyRainWarnings, setHeavyRainWarnings] = useState(true);
  const [routeBlockedAlerts, setRouteBlockedAlerts] = useState(true);
  const [dailyMorningSummary, setDailyMorningSummary] = useState(false);
  const [alertRadiusKm, setAlertRadiusKm] = useState(5);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [channels, setChannels] = useState({
    push: true,
    sms: true,
    whatsapp: false
  });

  // 3. Trip Preferences
  const [defaultRouteType, setDefaultRouteType] = useState<'fastest' | 'safest' | 'balanced'>('safest');
  const [vehicleType, setVehicleType] = useState<TripVehicle>(() => {
    try {
      const saved = localStorage.getItem('floodguard_trip_vehicle');
      if (saved === 'walk' || saved === 'two_wheeler' || saved === 'car' || saved === 'bus') {
        return saved;
      }
      if (saved === 'walking') return 'walk';
      if (saved === 'two-wheeler') return 'two_wheeler';
    } catch {}
    return 'car';
  });
  const [waterDepthThresholdCm, setWaterDepthThresholdCm] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('floodguard_trip_max_depth');
      if (saved && !isNaN(Number(saved))) return Number(saved);
    } catch {}
    return 15;
  });

  // 4. Display
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark');
  const [units, setUnits] = useState<'cm' | 'inches'>('cm');
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');
  const [highContrastMode, setHighContrastMode] = useState(false);

  // 5. Emergency
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'Rajesh Sharma', phone: '+91 98201 44521', relation: 'Family / Spouse' },
    { id: '2', name: 'Anita Desai', phone: '+91 98192 11840', relation: 'Emergency Contact' }
  ]);
  const [shareLocationDuringSevere, setShareLocationDuringSevere] = useState(true);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('Family');
  const [isAddingContact, setIsAddingContact] = useState(false);

  // Success Toast state
  const [showToast, setShowToast] = useState(false);

  // Helper for water depth slider helper text
  const getWaterDepthHelper = (depth: number) => {
    if (depth <= 12) return '10–12 cm: Safe for all small cars and compact vehicles.';
    if (depth <= 18) return '15 cm: Recommended threshold — deeper water can stall a sedan or hatchback engine.';
    if (depth <= 28) return '25 cm: Water reaches motorcycle exhaust pipes and low vehicle chassis.';
    return '30–60 cm: Hazardous — passable only by high-ground-clearance trucks and emergency vehicles.';
  };

  // Add Place
  const handleAddPlace = () => {
    if (!newPlaceName.trim() || !newPlaceAddress.trim()) return;
    setSavedPlaces([
      ...savedPlaces,
      {
        id: Date.now().toString(),
        name: newPlaceName.trim(),
        address: newPlaceAddress.trim(),
        type: newPlaceType
      }
    ]);
    setNewPlaceName('');
    setNewPlaceAddress('');
    setIsAddingPlace(false);
  };

  // Remove Place
  const handleRemovePlace = (id: string) => {
    setSavedPlaces(savedPlaces.filter((p) => p.id !== id));
  };

  // Add Contact
  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    setEmergencyContacts([
      ...emergencyContacts,
      {
        id: Date.now().toString(),
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        relation: newContactRelation
      }
    ]);
    setNewContactName('');
    setNewContactPhone('');
    setIsAddingContact(false);
  };

  // Remove Contact
  const handleRemoveContact = (id: string) => {
    setEmergencyContacts(emergencyContacts.filter((c) => c.id !== id));
  };

  // Save changes handler
  const handleSaveChanges = () => {
    if (onCityChange && homeCity !== currentCity) {
      onCityChange(homeCity);
    }
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3200);
  };

  // Reset to defaults
  const handleResetDefaults = () => {
    setHomeCity('mumbai');
    setSevereFloodAlerts(true);
    setHeavyRainWarnings(true);
    setRouteBlockedAlerts(true);
    setDailyMorningSummary(false);
    setAlertRadiusKm(5);
    setQuietHoursEnabled(false);
    setQuietHoursStart('22:00');
    setQuietHoursEnd('07:00');
    setChannels({ push: true, sms: true, whatsapp: false });
    setDefaultRouteType('safest');
    setVehicleType('car');
    setWaterDepthThresholdCm(15);
    setLanguage('en');
    setTheme('dark');
    setUnits('cm');
    setTextSize('normal');
    setHighContrastMode(false);
    setShareLocationDuringSevere(true);

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className={`flex-1 bg-slate-950 text-slate-100 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 select-none max-w-5xl mx-auto w-full pb-28 ${
      textSize === 'large' ? 'text-base' : 'text-sm'
    }`}>
      {/* Top Header */}
      <div className="pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
              USER PREFERENCES
            </span>
            <span className="text-xs text-slate-400">Personalized Flood Protection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Application Settings
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Configure your alerts, daily travel preferences, vehicle depth limits, and emergency contacts.
          </p>
        </div>
      </div>

      {/* 1. PROFILE AND LOCATION */}
      <section aria-label="Profile and Location" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-300 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              1. Profile & Location
            </h2>
            <p className="text-xs text-slate-400">
              Set your primary metropolitan city and frequently traveled addresses
            </p>
          </div>
        </div>

        {/* Home City Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Primary Home City
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['mumbai', 'delhi', 'chennai'] as CityId[]).map((cId) => {
              const info = CITIES_INFO[cId];
              const isSelected = homeCity === cId;
              return (
                <button
                  key={cId}
                  type="button"
                  onClick={() => setHomeCity(cId)}
                  className={`min-h-[48px] p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/90 border-cyan-500 text-white ring-1 ring-cyan-500 shadow-md shadow-cyan-950'
                      : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <strong className="block text-sm font-bold text-white">{info.name}</strong>
                    <span className="text-xs text-slate-400 truncate block">{info.state}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Saved Places */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Saved Places (Home, Work, School)
              </span>
              <span className="text-xs text-slate-400">
                Receive proactive warnings when flood levels rise near these areas
              </span>
            </div>

            <button
              onClick={() => setIsAddingPlace(!isAddingPlace)}
              className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Place</span>
            </button>
          </div>

          {/* New Place Inline Form */}
          {isAddingPlace && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Place Name (e.g., Mom's Home)"
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  className="min-h-[44px] px-3 rounded-xl bg-slate-900 border border-slate-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Street / Neighborhood Address"
                  value={newPlaceAddress}
                  onChange={(e) => setNewPlaceAddress(e.target.value)}
                  className="min-h-[44px] px-3 rounded-xl bg-slate-900 border border-slate-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <select
                  value={newPlaceType}
                  onChange={(e) => setNewPlaceType(e.target.value as any)}
                  className="min-h-[44px] px-3 rounded-xl bg-slate-900 border border-slate-750 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="school">School</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setIsAddingPlace(false)}
                  className="min-h-[40px] px-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPlace}
                  className="min-h-[40px] px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                >
                  Save Place
                </button>
              </div>
            </div>
          )}

          {/* Places List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {savedPlaces.map((place) => {
              const Icon =
                place.type === 'home'
                  ? Home
                  : place.type === 'work'
                  ? Briefcase
                  : place.type === 'school'
                  ? GraduationCap
                  : MapPin;
              return (
                <div
                  key={place.id}
                  className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <strong className="text-sm font-bold text-white block truncate">{place.name}</strong>
                      <span className="text-xs text-slate-400 truncate block mt-0.5">{place.address}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemovePlace(place.id)}
                    className="min-h-[36px] min-w-[36px] p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
                    title="Remove place"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. ALERTS */}
      <section aria-label="Alerts" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              2. Alerts & Notifications
            </h2>
            <p className="text-xs text-slate-400">
              Customize warning triggers, alert radius, and delivery channels
            </p>
          </div>
        </div>

        {/* 4 Alert Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Toggle 1 */}
          <label className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:border-slate-700 transition-colors">
            <div className="min-w-0">
              <strong className="text-sm font-bold text-white block">Severe Flood Alerts</strong>
              <span className="text-xs text-slate-400 block mt-0.5">
                Immediate alerts when water exceeds 30 cm on nearby arterials
              </span>
            </div>
            <input
              type="checkbox"
              checked={severeFloodAlerts}
              onChange={(e) => setSevereFloodAlerts(e.target.checked)}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer shrink-0"
            />
          </label>

          {/* Toggle 2 */}
          <label className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:border-slate-700 transition-colors">
            <div className="min-w-0">
              <strong className="text-sm font-bold text-white block">Heavy Rain Warnings</strong>
              <span className="text-xs text-slate-400 block mt-0.5">
                Notifications when radar detects rainfall intensity &gt; 40 mm/hr
              </span>
            </div>
            <input
              type="checkbox"
              checked={heavyRainWarnings}
              onChange={(e) => setHeavyRainWarnings(e.target.checked)}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer shrink-0"
            />
          </label>

          {/* Toggle 3 */}
          <label className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:border-slate-700 transition-colors">
            <div className="min-w-0">
              <strong className="text-sm font-bold text-white block">Route Blocked Alerts</strong>
              <span className="text-xs text-slate-400 block mt-0.5">
                Warn me if a road on my daily commute becomes impassable
              </span>
            </div>
            <input
              type="checkbox"
              checked={routeBlockedAlerts}
              onChange={(e) => setRouteBlockedAlerts(e.target.checked)}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer shrink-0"
            />
          </label>

          {/* Toggle 4 */}
          <label className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:border-slate-700 transition-colors">
            <div className="min-w-0">
              <strong className="text-sm font-bold text-white block">Daily Morning Summary</strong>
              <span className="text-xs text-slate-400 block mt-0.5">
                Daily 7:30 AM forecast of flood-prone subway underpasses
              </span>
            </div>
            <input
              type="checkbox"
              checked={dailyMorningSummary}
              onChange={(e) => setDailyMorningSummary(e.target.checked)}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer shrink-0"
            />
          </label>
        </div>

        {/* Alert Radius Slider */}
        <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Alert Radius: <strong className="text-cyan-400 font-mono text-sm">{alertRadiusKm} km</strong>
            </label>
            <span className="text-xs text-slate-400">Range: 1 km to 10 km</span>
          </div>

          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={alertRadiusKm}
            onChange={(e) => setAlertRadiusKm(Number(e.target.value))}
            className="w-full h-2 bg-slate-750 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>1 km (Neighborhood)</span>
            <span>5 km (Suburban)</span>
            <span>10 km (City-wide)</span>
          </div>
        </div>

        {/* Quiet Hours & Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Quiet Hours */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-sm font-bold text-white block">Quiet Hours</strong>
                <span className="text-xs text-slate-400 block">Pause non-critical alerts at night</span>
              </div>
              <input
                type="checkbox"
                checked={quietHoursEnabled}
                onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                className="w-5 h-5 accent-cyan-500 rounded cursor-pointer shrink-0"
              />
            </div>

            {quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">From:</span>
                  <input
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => setQuietHoursStart(e.target.value)}
                    className="w-full min-h-[44px] px-2.5 rounded-lg bg-slate-900 border border-slate-750 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">To:</span>
                  <input
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => setQuietHoursEnd(e.target.value)}
                    className="w-full min-h-[44px] px-2.5 rounded-lg bg-slate-900 border border-slate-750 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Delivery Channels */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3">
            <div>
              <strong className="text-sm font-bold text-white block">Notification Channels</strong>
              <span className="text-xs text-slate-400 block">Where alerts should be sent</span>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs cursor-pointer py-1">
                <span className="flex items-center gap-2 text-slate-200">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>Push Notifications</span>
                </span>
                <input
                  type="checkbox"
                  checked={channels.push}
                  onChange={(e) => setChannels({ ...channels, push: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer py-1">
                <span className="flex items-center gap-2 text-slate-200">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>SMS Text Alert</span>
                </span>
                <input
                  type="checkbox"
                  checked={channels.sms}
                  onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer py-1">
                <span className="flex items-center gap-2 text-slate-200">
                  <Radio className="w-4 h-4 text-green-400" />
                  <span>WhatsApp Broadcast</span>
                </span>
                <input
                  type="checkbox"
                  checked={channels.whatsapp}
                  onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ROUTE PREFERENCES */}
      <section aria-label="Route Preferences" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              3. Route & Vehicle Preferences
            </h2>
            <p className="text-xs text-slate-400">
              Calibrate how safe routes are calculated based on your vehicle clearance
            </p>
          </div>
        </div>

        {/* Route Type & Vehicle Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Default Route Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Default Route Strategy
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'fastest', label: 'Fastest', sub: 'Shortest ETA' },
                { id: 'safest', label: 'Safest', sub: 'Zero water' },
                { id: 'balanced', label: 'Balanced', sub: 'Optimal compromise' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setDefaultRouteType(r.id as any)}
                  className={`min-h-[48px] p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    defaultRouteType === r.id
                      ? 'bg-emerald-950/80 border-emerald-500 text-white ring-1 ring-emerald-500 shadow-sm'
                      : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <strong className="block text-xs font-bold">{r.label}</strong>
                  <span className="text-[10px] text-slate-400 block">{r.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Vehicle Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'walking', label: 'Walking' },
                { id: 'two-wheeler', label: 'Bike / Scooter' },
                { id: 'car', label: 'Car / Auto' },
                { id: 'emergency', label: 'Emergency Van' }
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVehicleType(v.id as any)}
                  className={`min-h-[48px] p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    vehicleType === v.id
                      ? 'bg-emerald-950/80 border-emerald-500 text-white ring-1 ring-emerald-500 shadow-sm'
                      : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold block">{v.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Avoid Water Deeper Than Slider */}
        <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Avoid Water Deeper Than: <strong className="text-emerald-400 font-mono text-sm">{waterDepthThresholdCm} cm</strong>
            </label>
            <span className="text-xs text-slate-400 font-mono">10 cm to 60 cm</span>
          </div>

          <input
            type="range"
            min={10}
            max={60}
            step={5}
            value={waterDepthThresholdCm}
            onChange={(e) => setWaterDepthThresholdCm(Number(e.target.value))}
            className="w-full h-2 bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{getWaterDepthHelper(waterDepthThresholdCm)}</span>
          </div>
        </div>
      </section>

      {/* 4. DISPLAY */}
      <section aria-label="Display Settings" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 text-blue-300 flex items-center justify-center shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              4. Display & Accessibility
            </h2>
            <p className="text-xs text-slate-400">
              Language, measurement units, text sizing, and high-contrast modes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Language */}
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Language
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'en', label: 'English' },
                { id: 'hi', label: 'हिंदी (Hindi)' },
                { id: 'mr', label: 'मराठी (Marathi)' }
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLanguage(l.id as any)}
                  className={`w-full min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold text-left flex items-center justify-between cursor-pointer ${
                    language === l.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{l.label}</span>
                  {language === l.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Theme
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'dark', label: 'Dark Mode (Standard)' },
                { id: 'light', label: 'Light Mode' },
                { id: 'auto', label: 'Auto (System)' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as any)}
                  className={`w-full min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold text-left flex items-center justify-between cursor-pointer ${
                    theme === t.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{t.label}</span>
                  {theme === t.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Units */}
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Units
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'cm', label: 'Metric (cm, mm/hr)' },
                { id: 'inches', label: 'Imperial (inches, in/hr)' }
              ].map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUnits(u.id as any)}
                  className={`w-full min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold text-left flex items-center justify-between cursor-pointer ${
                    units === u.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{u.label}</span>
                  {units === u.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Text Size & High Contrast */}
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Text Sizing
              </label>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => setTextSize('normal')}
                  className={`min-h-[36px] px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    textSize === 'normal' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setTextSize('large')}
                  className={`min-h-[36px] px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    textSize === 'large' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  Large (16px+)
                </button>
              </div>
            </div>

            <label className="flex items-center justify-between pt-2 border-t border-slate-800 cursor-pointer">
              <span className="text-xs font-bold text-white">High-Contrast Mode</span>
              <input
                type="checkbox"
                checked={highContrastMode}
                onChange={(e) => setHighContrastMode(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </section>

      {/* 5. EMERGENCY */}
      <section aria-label="Emergency Settings" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              5. Emergency Contacts & Safety Sharing
            </h2>
            <p className="text-xs text-slate-400">
              Trusted individuals who can receive your real-time safety status during severe flash floods
            </p>
          </div>
        </div>

        {/* Emergency Contacts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Emergency Contacts
            </span>
            <button
              onClick={() => setIsAddingContact(!isAddingContact)}
              className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-rose-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>

          {/* Add Contact Form */}
          {isAddingContact && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="min-h-[44px] px-3 rounded-xl bg-slate-900 border border-slate-750 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number (+91 ...)"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="min-h-[44px] px-3 rounded-xl bg-slate-900 border border-slate-750 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Relationship (e.g. Spouse, Parent)"
                  value={newContactRelation}
                  onChange={(e) => setNewContactRelation(e.target.value)}
                  className="min-h-[44px] px-3 rounded-xl bg-slate-900 border border-slate-750 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setIsAddingContact(false)}
                  className="min-h-[40px] px-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContact}
                  className="min-h-[40px] px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  Save Contact
                </button>
              </div>
            </div>
          )}

          {/* Contacts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 text-rose-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    {contact.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <strong className="text-sm font-bold text-white block truncate">{contact.name}</strong>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-slate-300">{contact.phone}</span>
                      <span>•</span>
                      <span>{contact.relation}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveContact(contact.id)}
                  className="min-h-[36px] min-w-[36px] p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
                  title="Remove contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Location Sharing Toggle */}
          <label className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:border-slate-750 transition-colors mt-2">
            <div className="min-w-0">
              <strong className="text-sm font-bold text-white block">
                Share live location during Severe Alerts
              </strong>
              <span className="text-xs text-slate-400 block mt-0.5">
                Automatically sends SMS coordinates to contacts if you are travelling near an inundated zone (&gt;30 cm)
              </span>
            </div>
            <input
              type="checkbox"
              checked={shareLocationDuringSevere}
              onChange={(e) => setShareLocationDuringSevere(e.target.checked)}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer shrink-0"
            />
          </label>
        </div>
      </section>

      {/* BOTTOM FIXED / STICKY ACTION BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-4 z-40 select-none">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={handleResetDefaults}
            className="text-xs text-slate-400 hover:text-slate-200 font-medium underline cursor-pointer"
          >
            Reset to defaults
          </button>

          <button
            onClick={handleSaveChanges}
            className="min-h-[48px] px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Small Success Toast */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <div className="text-xs sm:text-sm font-bold">
            Settings saved successfully!
          </div>
        </div>
      )}
    </div>
  );
};
