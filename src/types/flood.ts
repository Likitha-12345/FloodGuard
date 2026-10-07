export type CityId = 'mumbai' | 'delhi' | 'chennai';

export type PageId =
  | 'dashboard'
  | 'map'
  | 'trip-check'
  | 'emergency'
  | 'settings';

export type RiskLevel = 'safe' | 'moderate' | 'high' | 'severe';

export interface StreetForecastStep {
  timeOffsetMin: number; // 0, 15, 30, ..., 180
  predictedDepthCm: number;
  floodProbability: number; // 0 - 100
  riskLevel: RiskLevel;
  drainUtilization: number; // 0 - 100%
  flowVelocityMs: number; // m/s surface flow
}

export interface StreetFeature {
  id: string;
  name: string;
  neighborhood: string;
  cityId: CityId;
  coordinates: [number, number][]; // [lat, lng] points along the road or [lat, lng] centroid
  demElevationM: number; // meters above sea level
  slopePercent: number; // slope percentage
  depressionIndex: number; // 0 to 1 (higher = depression basin/subway)
  imperviousPercent: number; // % concrete/asphalt
  drainageDensityMPerHa: number; // drainage density
  pipeCapacityM3s: number; // design hydraulic capacity
  historicalIncidentsCount: number; // past flood reports
  distanceToDrainM: number;
  distanceToWaterbodyM: number;
  nearestDrainNodeId: string;
  forecast: StreetForecastStep[];
  // Summary at current selected time
  currentDepthCm?: number;
  currentProbability?: number;
  currentRisk?: RiskLevel;
  currentDrainUtilization?: number;
}

export interface DrainageNode {
  id: string;
  name: string;
  cityId: CityId;
  type: 'manhole' | 'inlet' | 'outfall' | 'pumping_station' | 'sluice_gate';
  coordinates: [number, number]; // [lat, lng]
  storageCapacityM3: number;
  currentVolumeM3: number;
  utilizationPercent: number;
  isSurcharging: boolean;
  surchargeDepthCm: number;
  pumpingRateM3s?: number;
  upstreamFlowM3s?: number;
  downstreamFlowM3s?: number;
  predictedOverflowMin?: number;
}

export interface DrainageEdge {
  id: string;
  name: string;
  fromNodeId: string;
  toNodeId: string;
  coordinates: [number, number][];
  diameterMm: number;
  maxDischargeM3s: number;
  currentDischargeM3s: number;
  utilizationPercent: number;
  isSurcharged: boolean;
}

export interface DrainageNetwork {
  nodes: DrainageNode[];
  edges: DrainageEdge[];
  overallUtilizationPercent: number;
  surchargingNodesCount: number;
  activePumpsCount: number;
}

export interface RainfallScenario {
  id: string;
  name: string;
  description: string;
  source: 'radar' | 'api' | 'historical' | 'simulated';
  intensityMmHr: number;
  cum1hMm: number;
  cum3hMm: number;
  cum6hMm: number;
  radarDbz: number; // Doppler Radar reflectivity in dBZ
  stationName: string;
  timestamp: string;
  forecastCurve: { timeOffsetMin: number; intensityMmHr: number }[];
}

export interface CityInfo {
  id: CityId;
  name: string;
  state: string;
  center: [number, number];
  zoom: number;
  description: string;
  primaryWaterbodies: string[];
  vulnerabilityZones: string[];
  hospitals: { name: string; coordinates: [number, number]; emergencyTier: string }[];
  landmarks: { name: string; coordinates: [number, number]; category: string }[];
  fireStations: { name: string; coordinates: [number, number]; code: string }[];
}


export interface DashboardSummary {
  cityId: CityId;
  timestamp: string;
  forecastHorizonMin: number;
  totalStreetsTracked: number;
  streetsAtRisk: number;
  severeStreetsCount: number;
  highRiskIntersectionsCount: number;
  maxWaterDepthCm: number;
  averageDrainUtilizationPercent: number;
  rainfallIntensityMmHr: number;
  radarDbz: number;
  forecastConfidencePercent: number;
  mlModelType: string;
  dataSource: string;
  weatherCondition: string;
}
