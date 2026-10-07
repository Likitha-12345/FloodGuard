import React, { useState, useEffect, useCallback } from 'react';
import {
  CityId,
  PageId,
  StreetFeature,
  DrainageNetwork,
  RainfallScenario,
  DashboardSummary
} from './types/flood';
import { INITIAL_RAINFALL_SCENARIOS, CITIES_INFO } from './data/citiesData';
import { FloodGuardApi } from './services/api';

// Navigation & Layout
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';

// Dedicated Pages
import { DashboardPage } from './pages/DashboardPage';
import { LiveFloodMapPage } from './pages/LiveFloodMapPage';
import { RoutePlannerPage } from './pages/RoutePlannerPage';
import { TripCheckPage } from './pages/TripCheckPage';
import { EmergencyOperationsPage } from './pages/EmergencyOperationsPage';
import { SettingsPage } from './pages/SettingsPage';

// Modals
import { RainfallIngestModal } from './components/RainfallIngestModal';

export default function App() {
  // Navigation & Page State
  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    const pathname = window.location.pathname.replace(/^\//, '');

    // Redirect old AI Copilot, Drainage, Rainfall, Nowcast, or legacy URLs to dashboard
    if (
      hash === 'ai-copilot' ||
      hash === 'copilot' ||
      pathname === 'ai-copilot' ||
      pathname === 'copilot' ||
      hash === 'drainage' ||
      hash === 'nowcast' ||
      hash === 'rainfall' ||
      hash === 'how-it-works' ||
      pathname === 'drainage' ||
      pathname === 'nowcast' ||
      pathname === 'rainfall'
    ) {
      window.location.hash = '#/dashboard';
      return 'dashboard';
    }

    const validPages: PageId[] = [
      'dashboard',
      'map',
      'route-planner',
      'trip-check',
      'emergency',
      'settings'
    ];
    return validPages.includes(hash as PageId) ? (hash as PageId) : 'dashboard';
  });

  // Trip Check to Route Planner handoff parameters
  const [routePlannerParams, setRoutePlannerParams] = useState<{
    from: string;
    to: string;
    vehicle: string;
  } | null>(null);

  // Sync hash with page
  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    window.location.hash = `#/${page}`;
  };

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      const pathname = window.location.pathname.replace(/^\//, '');

      // Redirect old AI Copilot, Drainage, Rainfall, Nowcast, or legacy URLs to dashboard
      if (
        hash === 'ai-copilot' ||
        hash === 'copilot' ||
        pathname === 'ai-copilot' ||
        pathname === 'copilot' ||
        hash === 'drainage' ||
        hash === 'nowcast' ||
        hash === 'rainfall' ||
        hash === 'how-it-works' ||
        pathname === 'drainage' ||
        pathname === 'nowcast' ||
        pathname === 'rainfall'
      ) {
        setCurrentPage('dashboard');
        window.location.hash = '#/dashboard';
        return;
      }

      const validPages: PageId[] = [
        'dashboard',
        'map',
        'route-planner',
        'trip-check',
        'emergency',
        'settings'
      ];
      if (validPages.includes(hash as PageId)) {
        setCurrentPage(hash as PageId);
      } else {
        setCurrentPage('dashboard');
        window.location.hash = '#/dashboard';
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Municipal Telemetry State
  const [currentCity, setCurrentCity] = useState<CityId>('mumbai');
  const [activeScenario, setActiveScenario] = useState<RainfallScenario>(INITIAL_RAINFALL_SCENARIOS[0]);
  const [timeOffsetMin, setTimeOffsetMin] = useState<number>(0);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  const [streets, setStreets] = useState<StreetFeature[]>([]);
  const [drainage, setDrainage] = useState<DrainageNetwork>({
    nodes: [],
    edges: [],
    overallUtilizationPercent: 0,
    surchargingNodesCount: 0,
    activePumpsCount: 0
  });
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
  );

  // Load telemetry for simulated or active scenario
  const loadData = useCallback(async (scenarioOverride?: RainfallScenario) => {
    const sc = scenarioOverride || activeScenario;
    try {
      const mapData = await FloodGuardApi.getFloodMap(currentCity, timeOffsetMin, sc);
      setStreets(mapData.streets);
      setDrainage(mapData.drainage);

      const summaryData = await FloodGuardApi.getDashboardSummary(currentCity, timeOffsetMin, sc);
      setSummary(summaryData);
      setLastUpdatedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST');
    } catch (err) {
      console.error('Error loading flood data:', err);
    }
  }, [currentCity, timeOffsetMin, activeScenario]);

  // Fetch real live rainfall forecast from Open-Meteo
  const fetchLiveRainfall = useCallback(async (cityId: CityId) => {
    setIsLoadingLive(true);
    setLiveError(null);
    try {
      const res = await FloodGuardApi.getLiveRainfall(cityId);
      if (res.scenario) {
        setActiveScenario(res.scenario);
        // Compute and update flood simulation outputs immediately with the live scenario
        const mapData = await FloodGuardApi.getFloodMap(cityId, timeOffsetMin, res.scenario);
        setStreets(mapData.streets);
        setDrainage(mapData.drainage);

        const summaryData = await FloodGuardApi.getDashboardSummary(cityId, timeOffsetMin, res.scenario);
        setSummary(summaryData);
        setLastUpdatedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST');
      }
      if (!res.success && res.error) {
        setLiveError(res.error);
      }
    } catch (err: any) {
      console.error('Failed to fetch live rainfall from Open-Meteo:', err);
      setLiveError('Live data unavailable');
      // Fall back to current data
      loadData();
    } finally {
      setIsLoadingLive(false);
    }
  }, [timeOffsetMin, loadData]);

  // Initial load and whenever city changes
  useEffect(() => {
    if (activeScenario.id === 'live') {
      fetchLiveRainfall(currentCity);
    } else {
      loadData();
    }
  }, [currentCity]); // Run when city changes

  // 10-Minute Polling Interval for live Open-Meteo forecast
  useEffect(() => {
    if (activeScenario.id !== 'live') return;

    // Refetch every 10 minutes (600,000 ms)
    const intervalId = setInterval(() => {
      fetchLiveRainfall(currentCity);
    }, 10 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [currentCity, activeScenario.id, fetchLiveRainfall]);

  // Handle City Switch
  const handleCityChange = (newCity: CityId) => {
    setCurrentCity(newCity);
    if (activeScenario.id === 'live') {
      fetchLiveRainfall(newCity);
    }
  };

  // Handle Rainfall Scenario Change
  const handleScenarioChange = async (scenarioId: string) => {
    if (scenarioId === 'live') {
      await fetchLiveRainfall(currentCity);
      return;
    }
    const res = await FloodGuardApi.ingestRainfall(currentCity, scenarioId);
    if (res.scenario) {
      setActiveScenario(res.scenario);
      setLiveError(null);
      await loadData(res.scenario);
    }
  };

  // Custom Radar Ingest
  const handleCustomIngest = async (customData: Partial<RainfallScenario>) => {
    const res = await FloodGuardApi.ingestRainfall(currentCity, undefined, customData);
    if (res.scenario) {
      setActiveScenario(res.scenario);
      setLiveError(null);
      await loadData(res.scenario);
    }
  };

  const emergencyAlertCount = streets.filter(s => (s.currentDepthCm || 0) >= 30).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 1. Fixed Left Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        currentCity={currentCity}
        emergencyAlertCount={emergencyAlertCount}
      />

      {/* Main Right Workspace Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* 2. Compact Top Navigation Bar */}
        <TopNav
          currentCity={currentCity}
          onCityChange={handleCityChange}
          activeScenario={activeScenario}
          onScenarioChange={handleScenarioChange}
          onOpenIngestModal={() => setIsIngestModalOpen(true)}
          lastUpdatedTime={lastUpdatedTime}
          isLoadingLive={isLoadingLive}
          liveError={liveError}
          onRefreshData={() => activeScenario.id === 'live' ? fetchLiveRainfall(currentCity) : loadData()}
        />

        {/* 3. Dedicated Page Routing */}
        <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative">
          {currentPage === 'dashboard' && (
            <DashboardPage
              currentCity={currentCity}
              streets={streets}
              drainage={drainage}
              summary={summary}
              activeScenario={activeScenario}
              onNavigateToMap={() => handleNavigate('map')}
              onNavigateToRoute={() => handleNavigate('route-planner')}
              onNavigateToTripCheck={() => handleNavigate('trip-check')}
            />
          )}

          {currentPage === 'map' && (
            <LiveFloodMapPage
              currentCity={currentCity}
              streets={streets}
              activeScenario={activeScenario}
              timeOffsetMin={timeOffsetMin}
              onChangeTimeOffset={(offset) => setTimeOffsetMin(offset)}
              onNavigateToRouteWithStreet={(st) => {
                handleNavigate('route-planner');
              }}
            />
          )}

          {currentPage === 'route-planner' && (
            <RoutePlannerPage
              currentCity={currentCity}
              streets={streets}
              timeOffsetMin={timeOffsetMin}
              activeScenario={activeScenario}
              initialOrigin={routePlannerParams?.from}
              initialDestination={routePlannerParams?.to}
              initialVehicle={routePlannerParams?.vehicle}
            />
          )}

          {currentPage === 'trip-check' && (
            <TripCheckPage
              currentCity={currentCity}
              streets={streets}
              activeScenario={activeScenario}
              onOpenSafeRoute={(params) => {
                setRoutePlannerParams(params);
                handleNavigate('route-planner');
              }}
            />
          )}

          {currentPage === 'emergency' && (
            <EmergencyOperationsPage
              currentCity={currentCity}
              streets={streets}
              drainage={drainage}
              summary={summary}
              onNavigateToRoute={() => handleNavigate('route-planner')}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              currentCity={currentCity}
              onCityChange={handleCityChange}
              activeScenario={activeScenario}
            />
          )}
        </main>
      </div>

      {/* Global Ingestion Modal */}
      <RainfallIngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        currentCity={currentCity}
        onIngest={handleCustomIngest}
      />
    </div>
  );
}
