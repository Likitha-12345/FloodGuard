import {
  CityId,
  StreetFeature,
  DrainageNetwork,
  RainfallScenario,
  DashboardSummary
} from '../types/flood';
import { FloodSimulationEngine } from './floodSimulationEngine';
import { INITIAL_RAINFALL_SCENARIOS, CITIES_INFO } from '../data/citiesData';
import { fetchLiveRainfallFromOpenMeteo, LiveRainfallResult } from './openMeteoService';

export class FloodGuardApi {
  /**
   * Fetch real live rainfall forecast from Open-Meteo
   */
  public static async getLiveRainfall(cityId: CityId): Promise<LiveRainfallResult> {
    try {
      const res = await fetch(`/api/rainfall/live?cityId=${cityId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.scenario) {
          return data;
        }
      }
    } catch (err) {
      console.warn('Backend live rainfall route failed, calling Open-Meteo directly:', err);
    }

    // Direct browser fetch fallback
    try {
      const direct = await fetchLiveRainfallFromOpenMeteo(cityId);
      // Ingest into server state in background
      if (direct.scenario) {
        fetch('/api/rainfall/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cityId, customData: direct.scenario })
        }).catch(() => {});
      }
      return direct;
    } catch (err: any) {
      console.error('All live rainfall fetch attempts failed:', err);
      return {
        success: false,
        scenario: INITIAL_RAINFALL_SCENARIOS[0],
        isCached: false,
        error: 'Live data unavailable'
      };
    }
  }
  /**
   * Fetch flood map data (streets, drainage, scenario)
   */
  public static async getFloodMap(
    cityId: CityId,
    timeOffsetMin: number,
    activeScenario?: RainfallScenario
  ): Promise<{
    cityId: CityId;
    streets: StreetFeature[];
    drainage: DrainageNetwork;
    scenario: RainfallScenario;
  }> {
    try {
      const res = await fetch(`/api/flood/map?cityId=${cityId}&timeOffsetMin=${timeOffsetMin}`);
      if (!res.ok) throw new Error('Failed to fetch map data from server');
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Using client-side hydro-engine fallback:', err);
      const scenario = activeScenario || INITIAL_RAINFALL_SCENARIOS[0];
      const streets = FloodSimulationEngine.simulateCityStreets(cityId, scenario, timeOffsetMin);
      const drainage = FloodSimulationEngine.simulateDrainageNetwork(cityId, scenario, timeOffsetMin);
      return { cityId, streets, drainage, scenario };
    }
  }

  /**
   * Fetch city-level dashboard telemetry
   */
  public static async getDashboardSummary(
    cityId: CityId,
    timeOffsetMin: number,
    activeScenario?: RainfallScenario
  ): Promise<DashboardSummary> {
    try {
      const res = await fetch(`/api/dashboard/summary?cityId=${cityId}&timeOffsetMin=${timeOffsetMin}`);
      if (!res.ok) throw new Error('Failed to fetch summary from server');
      return await res.json();
    } catch (err) {
      const scenario = activeScenario || INITIAL_RAINFALL_SCENARIOS[0];
      return FloodSimulationEngine.getDashboardSummary(cityId, scenario, timeOffsetMin);
    }
  }

  /**
   * Ingest rainfall scenario or custom radar feed
   */
  public static async ingestRainfall(
    cityId: CityId,
    scenarioId?: string,
    customData?: Partial<RainfallScenario>
  ): Promise<{ success: boolean; scenario: RainfallScenario }> {
    try {
      const res = await fetch('/api/rainfall/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityId, scenarioId, customData })
      });
      if (!res.ok) throw new Error('Ingest failed on server');
      return await res.json();
    } catch (err) {
      console.warn('Rainfall ingest fallback:', err);
      const matched = INITIAL_RAINFALL_SCENARIOS.find(s => s.id === scenarioId) || INITIAL_RAINFALL_SCENARIOS[0];
      return { success: true, scenario: matched };
    }
  }
}
