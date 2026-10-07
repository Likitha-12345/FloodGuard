import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { FloodSimulationEngine } from './src/services/floodSimulationEngine';
import { INITIAL_RAINFALL_SCENARIOS, BASE_STREETS, DRAINAGE_NETWORKS, CITIES_INFO } from './src/data/citiesData';
import { CityId, RainfallScenario } from './src/types/flood';
import { fetchLiveRainfallFromOpenMeteo } from './src/services/openMeteoService';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory active scenario state per city
const activeScenarios: Record<CityId, RainfallScenario> = {
  mumbai: { ...INITIAL_RAINFALL_SCENARIOS[0] },
  delhi: { ...INITIAL_RAINFALL_SCENARIOS[0] },
  chennai: { ...INITIAL_RAINFALL_SCENARIOS[0] }
};

/**
 * GET /api/rainfall/live
 * Retrieve live precipitation telemetry from Open-Meteo API
 */
app.get('/api/rainfall/live', async (req: Request, res: Response) => {
  const cityId = (req.query.cityId as CityId) || 'mumbai';
  try {
    const result = await fetchLiveRainfallFromOpenMeteo(cityId);
    if (result.scenario) {
      activeScenarios[cityId] = result.scenario;
    }
    return res.json(result);
  } catch (err: any) {
    console.error('Error fetching live rainfall:', err);
    return res.status(500).json({
      success: false,
      scenario: activeScenarios[cityId],
      error: 'Live data unavailable'
    });
  }
});

/**
 * POST /api/rainfall/ingest
 * Ingest rainfall observations, radar dBZ, or select simulation scenario
 */
app.post('/api/rainfall/ingest', (req: Request, res: Response) => {
  const { cityId, scenarioId, customData } = req.body;
  const targetCity: CityId = (cityId as CityId) || 'mumbai';

  if (scenarioId) {
    const matched = INITIAL_RAINFALL_SCENARIOS.find(s => s.id === scenarioId);
    if (matched) {
      activeScenarios[targetCity] = { ...matched, timestamp: new Date().toLocaleTimeString('en-IN') + ' IST' };
      return res.json({
        success: true,
        message: `Scenario '${matched.name}' activated for ${targetCity}`,
        scenario: activeScenarios[targetCity]
      });
    }
  }

  if (customData) {
    const intensity = Number(customData.intensityMmHr) || 45.0;
    const radarDbz = Number(customData.radarDbz) || 48.0;
    activeScenarios[targetCity] = {
      id: 'custom_ingest',
      name: customData.name || 'User Ingested Doppler Radar Stream',
      description: 'Dynamic user telemetry ingested into ML nowcasting pipeline.',
      source: customData.source || 'radar',
      intensityMmHr: intensity,
      cum1hMm: Number(customData.cum1hMm) || intensity * 0.9,
      cum3hMm: Number(customData.cum3hMm) || intensity * 2.1,
      cum6hMm: Number(customData.cum6hMm) || intensity * 3.2,
      radarDbz,
      stationName: customData.stationName || 'IMD Regional Doppler Radar Feed',
      timestamp: new Date().toLocaleTimeString('en-IN') + ' IST',
      forecastCurve: [
        { timeOffsetMin: 0, intensityMmHr: intensity },
        { timeOffsetMin: 15, intensityMmHr: intensity * 1.15 },
        { timeOffsetMin: 30, intensityMmHr: intensity * 1.28 },
        { timeOffsetMin: 45, intensityMmHr: intensity * 1.2 },
        { timeOffsetMin: 60, intensityMmHr: intensity * 0.95 },
        { timeOffsetMin: 75, intensityMmHr: intensity * 0.8 },
        { timeOffsetMin: 90, intensityMmHr: intensity * 0.65 },
        { timeOffsetMin: 105, intensityMmHr: intensity * 0.5 },
        { timeOffsetMin: 120, intensityMmHr: intensity * 0.38 },
        { timeOffsetMin: 135, intensityMmHr: intensity * 0.28 },
        { timeOffsetMin: 150, intensityMmHr: intensity * 0.18 },
        { timeOffsetMin: 165, intensityMmHr: intensity * 0.1 },
        { timeOffsetMin: 180, intensityMmHr: intensity * 0.05 }
      ]
    };

    return res.json({
      success: true,
      message: 'Custom rainfall observation ingested successfully',
      scenario: activeScenarios[targetCity]
    });
  }

  res.json({
    success: true,
    scenario: activeScenarios[targetCity]
  });
});

/**
 * POST /api/flood/predict
 * Generate flood predictions at given forecast horizon
 */
app.post('/api/flood/predict', (req: Request, res: Response) => {
  const { cityId = 'mumbai', timeOffsetMin = 0 } = req.body;
  const targetCity = cityId as CityId;
  const scenario = activeScenarios[targetCity] || INITIAL_RAINFALL_SCENARIOS[0];

  const streets = FloodSimulationEngine.simulateCityStreets(targetCity, scenario, Number(timeOffsetMin));
  const drainage = FloodSimulationEngine.simulateDrainageNetwork(targetCity, scenario, Number(timeOffsetMin));
  const summary = FloodSimulationEngine.getDashboardSummary(targetCity, scenario, Number(timeOffsetMin));

  res.json({
    success: true,
    cityId: targetCity,
    timeOffsetMin: Number(timeOffsetMin),
    streets,
    drainage,
    summary,
    metadata: {
      model: 'XGBoost v2.1 Hydro-Regressor',
      calibratedAt: '2026-10-06T03:00:00Z',
      isDemonstration: scenario.source === 'simulated'
    }
  });
});

/**
 * GET /api/flood/map
 * Retrieve geospatial flood predictions
 */
app.get('/api/flood/map', async (req: Request, res: Response) => {
  const cityId = (req.query.cityId as CityId) || 'mumbai';
  const timeOffsetMin = Number(req.query.timeOffsetMin) || 0;
  let scenario = activeScenarios[cityId] || INITIAL_RAINFALL_SCENARIOS[0];

  if (scenario.id === 'live' && scenario.timestamp === 'Live Feed') {
    try {
      const liveRes = await fetchLiveRainfallFromOpenMeteo(cityId);
      if (liveRes.scenario) {
        activeScenarios[cityId] = liveRes.scenario;
        scenario = liveRes.scenario;
      }
    } catch (e) {
      // keep existing fallback
    }
  }

  const streets = FloodSimulationEngine.simulateCityStreets(cityId, scenario, timeOffsetMin);
  const drainage = FloodSimulationEngine.simulateDrainageNetwork(cityId, scenario, timeOffsetMin);

  res.json({
    cityId,
    cityInfo: CITIES_INFO[cityId],
    timeOffsetMin,
    streets,
    drainage,
    scenario
  });
});

/**
 * GET /api/flood/street/:street_id
 * Retrieve street-level flood details
 */
app.get('/api/flood/street/:street_id', (req: Request, res: Response) => {
  const streetId = req.params.street_id;
  const cityId = (req.query.cityId as CityId) || 'mumbai';
  const scenario = activeScenarios[cityId] || INITIAL_RAINFALL_SCENARIOS[0];

  const streets = FloodSimulationEngine.simulateCityStreets(cityId, scenario, 0);
  const street = streets.find(s => s.id === streetId);

  if (!street) {
    return res.status(404).json({ error: `Street '${streetId}' not found.` });
  }

  const drainage = FloodSimulationEngine.simulateDrainageNetwork(cityId, scenario, 0);
  const connectedNode = drainage.nodes.find(n => n.id === street.nearestDrainNodeId);

  res.json({
    street,
    connectedNode,
    scenario
  });
});

/**
 * GET /api/drainage/status
 * Retrieve drainage network status
 */
app.get('/api/drainage/status', (req: Request, res: Response) => {
  const cityId = (req.query.cityId as CityId) || 'mumbai';
  const timeOffsetMin = Number(req.query.timeOffsetMin) || 0;
  const scenario = activeScenarios[cityId] || INITIAL_RAINFALL_SCENARIOS[0];

  const drainage = FloodSimulationEngine.simulateDrainageNetwork(cityId, scenario, timeOffsetMin);
  res.json({
    cityId,
    timeOffsetMin,
    drainage
  });
});

/**
 * POST /api/routes/safe
 * Calculate flood-aware route
 */
app.post('/api/routes/safe', (req: Request, res: Response) => {
  const {
    cityId = 'mumbai',
    origin,
    destination,
    emergencyMode = false,
    clearanceThresholdCm = 15,
    timeOffsetMin = 0,
    travelMode = 'car'
  } = req.body;

  const targetCity = cityId as CityId;
  const isEmergency = emergencyMode || travelMode === 'emergency' || travelMode === 'fire';
  const scenario = activeScenarios[targetCity] || INITIAL_RAINFALL_SCENARIOS[0];
  const streets = FloodSimulationEngine.simulateCityStreets(targetCity, scenario, Number(timeOffsetMin));

  const originCoord: [number, number] = origin?.coordinates || CITIES_INFO[targetCity].center;
  const originLabel: string = origin?.label || 'Selected Origin';

  const destCoord: [number, number] = destination?.coordinates ||
    (CITIES_INFO[targetCity].hospitals[0]?.coordinates || [targetCity === 'mumbai' ? 19.0028 : 28.5672, targetCity === 'mumbai' ? 72.8427 : 77.2100]);
  const destLabel: string = destination?.label || CITIES_INFO[targetCity].hospitals[0]?.name || 'Hospital / Safe Zone';

  const routeResult = FloodSimulationEngine.calculateSafeRoute(
    targetCity,
    originCoord,
    originLabel,
    destCoord,
    destLabel,
    streets,
    Boolean(isEmergency),
    Number(clearanceThresholdCm)
  );

  res.json(routeResult);
});

/**
 * GET /api/dashboard/summary
 * Retrieve city-level flood statistics
 */
app.get('/api/dashboard/summary', async (req: Request, res: Response) => {
  const cityId = (req.query.cityId as CityId) || 'mumbai';
  const timeOffsetMin = Number(req.query.timeOffsetMin) || 0;
  let scenario = activeScenarios[cityId] || INITIAL_RAINFALL_SCENARIOS[0];

  if (scenario.id === 'live' && scenario.timestamp === 'Live Feed') {
    try {
      const liveRes = await fetchLiveRainfallFromOpenMeteo(cityId);
      if (liveRes.scenario) {
        activeScenarios[cityId] = liveRes.scenario;
        scenario = liveRes.scenario;
      }
    } catch (e) {
      // keep existing fallback
    }
  }

  const summary = FloodSimulationEngine.getDashboardSummary(cityId, scenario, timeOffsetMin);
  res.json(summary);
});


// Mounting Vite in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FloodGuard AI] Server listening on port ${PORT}`);
  });
}

startServer();
