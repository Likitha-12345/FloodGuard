import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  Map,
  ShieldCheck,
  Siren,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { PageId, CityId } from '../types/flood';
import { CITIES_INFO } from '../data/citiesData';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  currentCity: CityId;
  emergencyAlertCount: number;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  alertCount?: number;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  currentCity,
  emergencyAlertCount
}) => {
  const city = CITIES_INFO[currentCity];

  const navSections: NavSection[] = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'map', label: 'Flood Map', icon: Map }
      ]
    },
    {
      group: 'PLANNING',
      items: [
        { id: 'trip-check', label: 'Trip Check', icon: ShieldCheck }
      ]
    },
    {
      group: 'RESPONSE',
      items: [
        {
          id: 'emergency',
          label: 'Emergency',
          icon: Siren,
          alertCount: emergencyAlertCount
        }
      ]
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', icon: Sliders }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-850 flex flex-col h-screen shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center space-x-3 bg-slate-950/80">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/20 shrink-0">
          <ShieldAlert className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-1.5">
            <h1 className="font-bold text-base tracking-tight text-white truncate">
              FloodGuard AI
            </h1>
          </div>
          <p className="text-[11px] font-medium text-cyan-400/90 truncate tracking-wide">
            Urban Flood Intelligence
          </p>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {navSections.map((section) => (
          <div key={section.group} className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {section.group}
            </div>

            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-600 text-white font-semibold shadow-md shadow-cyan-900/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-white'
                            : item.id === 'emergency'
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">

                      {item.badge && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.badge}
                        </span>
                      )}

                      {item.alertCount !== undefined && item.alertCount > 0 && (
                        <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-rose-600 text-white animate-pulse">
                          {item.alertCount}
                        </span>
                      )}

                      {!isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Municipal Node Telemetry Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-medium text-slate-300">City Region:</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="text-white font-bold truncate">
            {city.name}
          </div>
        </div>
      </div>
    </aside>
  );
};
