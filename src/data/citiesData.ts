import { CityId, CityInfo, StreetFeature, DrainageNode, DrainageEdge, DrainageNetwork, RainfallScenario } from '../types/flood';

export const CITIES_INFO: Record<CityId, CityInfo> = {
  mumbai: {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    center: [19.0178, 72.8478],
    zoom: 13,
    description: 'Coastal peninsula with reclaimed land, high tide vulnerability, and critical low-lying underpasses along the Central and Western railway corridors.',
    primaryWaterbodies: ['Mithi River', 'Arabian Sea', 'Mahim Bay', 'Poisar River', 'Oshiwara River'],
    vulnerabilityZones: ['Hindmata Junction', 'Milan Subway', 'Andheri Subway', 'Gandhi Market', 'Kurla LBS Marg'],
    hospitals: [
      { name: 'KEM Hospital (Parel)', coordinates: [19.0028, 72.8427], emergencyTier: 'Level 1 Trauma & Tertiary' },
      { name: 'Lilavati Hospital (Bandra West)', coordinates: [19.0514, 72.8291], emergencyTier: 'Super-Specialty Trauma' },
      { name: 'Hinduja Hospital (Mahim)', coordinates: [19.0335, 72.8391], emergencyTier: 'Cardiac & Acute Care' },
      { name: 'Nanavati Hospital (Vile Parle)', coordinates: [19.0967, 72.8415], emergencyTier: 'Critical Care Facility' },
      { name: 'Sion Hospital (LTMMC)', coordinates: [19.0375, 72.8612], emergencyTier: 'Major Municipal Trauma Hub' }
    ],
    landmarks: [
      { name: 'Dadar TT Circle', coordinates: [19.0178, 72.8478], category: 'Transit Hub' },
      { name: 'Bandra-Kurla Complex (BKC)', coordinates: [19.0667, 72.8687], category: 'Financial District' },
      { name: 'Chhatrapati Shivaji Maharaj Terminus', coordinates: [18.9401, 72.8354], category: 'Rail Terminal' },
      { name: 'Mumbai Airport (T2)', coordinates: [19.0896, 72.8656], category: 'Aviation Hub' },
      { name: 'Mahim Causeway', coordinates: [19.0436, 72.8419], category: 'Arterial Link' }
    ],
    fireStations: [
      { name: 'Byculla Fire Command HQ', coordinates: [18.9750, 72.8330], code: 'MCGM-FS-01' },
      { name: 'Dadar Fire Brigade Station', coordinates: [19.0195, 72.8432], code: 'MCGM-FS-04' },
      { name: 'Bandra Kurla Disaster Response Post', coordinates: [19.0645, 72.8620], code: 'SDRF-MUM-02' }
    ]
  },
  delhi: {
    id: 'delhi',
    name: 'Delhi NCR',
    state: 'NCT of Delhi',
    center: [28.6328, 77.2285],
    zoom: 13,
    description: 'Dense urban basin with complex micro-topography, ring road underpasses, and Yamuna River floodplain backflow dynamics.',
    primaryWaterbodies: ['Yamuna River', 'Najafgarh Drain', 'Barapullah Nallah', 'Hindon Canal'],
    vulnerabilityZones: ['Minto Bridge Underpass', 'ITO Junction', 'Pragati Maidan / Bhairon Marg', 'Pul Prahladpur', 'Kashmere Gate ISBT'],
    hospitals: [
      { name: 'AIIMS New Delhi (Ansari Nagar)', coordinates: [28.5672, 77.2100], emergencyTier: 'Apex Trauma Center' },
      { name: 'Safdarjung Hospital', coordinates: [28.5694, 77.2076], emergencyTier: 'Emergency & Burns Center' },
      { name: 'LNJP Hospital (Delhi Gate)', coordinates: [28.6368, 77.2415], emergencyTier: 'Central Delhi Trauma' },
      { name: 'Ram Manohar Lohia (RML) Hospital', coordinates: [28.6253, 77.2025], emergencyTier: 'Disaster Rapid Response' }
    ],
    landmarks: [
      { name: 'Connaught Place', coordinates: [28.6315, 77.2167], category: 'Central Commercial Hub' },
      { name: 'India Gate / Central Vista', coordinates: [28.6129, 77.2295], category: 'National Monument' },
      { name: 'New Delhi Railway Station (NDLS)', coordinates: [28.6430, 77.2195], category: 'Rail Terminal' },
      { name: 'Pragati Maidan Bharat Mandapam', coordinates: [28.6186, 77.2435], category: 'Convention Center' },
      { name: 'Kashmere Gate ISBT', coordinates: [28.6675, 77.2289], category: 'Interstate Bus Terminal' }
    ],
    fireStations: [
      { name: 'Connaught Place Fire Station', coordinates: [28.6295, 77.2185], code: 'DFS-CP-01' },
      { name: 'Pragati Maidan Fire Post', coordinates: [28.6160, 77.2410], code: 'DFS-PM-03' },
      { name: 'AIIMS Emergency Rescue Station', coordinates: [28.5680, 77.2140], code: 'DFS-ST-05' }
    ]
  },
  chennai: {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    center: [13.0418, 80.2341],
    zoom: 13,
    description: 'Flat coastal plain characterized by slow gravity drainage, marshland reclamation in the south, and tidal surges along the Buckingham Canal.',
    primaryWaterbodies: ['Adyar River', 'Cooum River', 'Buckingham Canal', 'Pallikaranai Marsh', 'Otteri Nullah'],
    vulnerabilityZones: ['Velachery Main Road', 'Usman Road (T. Nagar)', 'Madipakkam Lake Road', 'Mudichur Basin', 'Vyasarpadi Subway'],
    hospitals: [
      { name: 'Rajiv Gandhi Govt General Hospital (Central)', coordinates: [13.0805, 80.2785], emergencyTier: 'Government Apex Trauma' },
      { name: 'Apollo Hospitals (Greams Road)', coordinates: [13.0583, 80.2526], emergencyTier: 'Tertiary Emergency Care' },
      { name: 'MIOT International (Manapakkam)', coordinates: [13.0182, 80.1788], emergencyTier: 'Multi-Specialty Trauma' },
      { name: 'Government Multi Super Speciality Hospital (Omandurar)', coordinates: [13.0673, 80.2736], emergencyTier: 'Cardiac & Trauma Care' }
    ],
    landmarks: [
      { name: 'Chennai Central Railway Station', coordinates: [13.0827, 80.2755], category: 'Rail Terminal' },
      { name: 'Kathipara Cloverleaf Junction (Guindy)', coordinates: [13.0076, 80.2031], category: 'Arterial Interchange' },
      { name: 'Panagal Park (T. Nagar)', coordinates: [13.0416, 80.2335], category: 'Commercial Core' },
      { name: 'Phoenix Marketcity (Velachery)', coordinates: [12.9915, 80.2173], category: 'Retail & Transit Nexus' },
      { name: 'Marina Beach Promenade', coordinates: [13.0500, 80.2824], category: 'Coastal Boulevard' }
    ],
    fireStations: [
      { name: 'Egmore Fire Station & Rescue HQ', coordinates: [13.0780, 80.2600], code: 'TNFRS-EGM-01' },
      { name: 'T. Nagar Fire Post', coordinates: [13.0390, 80.2310], code: 'TNFRS-TN-02' },
      { name: 'Guindy Industrial Estate Rescue Unit', coordinates: [13.0100, 80.2050], code: 'TNFRS-GD-04' }
    ]
  }
};

export const INITIAL_RAINFALL_SCENARIOS: RainfallScenario[] = [
  {
    id: 'live',
    name: 'Live (Open-Meteo)',
    description: 'Real-time rainfall observations and 0-3h nowcast from Open-Meteo Weather API.',
    source: 'api',
    intensityMmHr: 0.0,
    cum1hMm: 0.0,
    cum3hMm: 0.0,
    cum6hMm: 0.0,
    radarDbz: 0.0,
    stationName: 'Open-Meteo NWP Grid',
    timestamp: 'Live Feed',
    forecastCurve: [
      { timeOffsetMin: 0, intensityMmHr: 0 },
      { timeOffsetMin: 15, intensityMmHr: 0 },
      { timeOffsetMin: 30, intensityMmHr: 0 },
      { timeOffsetMin: 45, intensityMmHr: 0 },
      { timeOffsetMin: 60, intensityMmHr: 0 },
      { timeOffsetMin: 75, intensityMmHr: 0 },
      { timeOffsetMin: 90, intensityMmHr: 0 },
      { timeOffsetMin: 105, intensityMmHr: 0 },
      { timeOffsetMin: 120, intensityMmHr: 0 },
      { timeOffsetMin: 135, intensityMmHr: 0 },
      { timeOffsetMin: 150, intensityMmHr: 0 },
      { timeOffsetMin: 165, intensityMmHr: 0 },
      { timeOffsetMin: 180, intensityMmHr: 0 }
    ]
  },
  {
    id: 'monsoon_deluge',
    name: 'Demo: Heavy Monsoon Deluge',
    description: 'Simulated high-impact convective storm cells over metropolitan catchment (cloudburst scale).',
    source: 'simulated',
    intensityMmHr: 58.5,
    cum1hMm: 62.0,
    cum3hMm: 135.0,
    cum6hMm: 198.0,
    radarDbz: 51.2,
    stationName: 'Demo Historical Replay (IMD Colaba)',
    timestamp: 'Demo Scenario',
    forecastCurve: [
      { timeOffsetMin: 0, intensityMmHr: 58.5 },
      { timeOffsetMin: 15, intensityMmHr: 67.0 },
      { timeOffsetMin: 30, intensityMmHr: 76.5 },
      { timeOffsetMin: 45, intensityMmHr: 82.0 },
      { timeOffsetMin: 60, intensityMmHr: 71.0 },
      { timeOffsetMin: 75, intensityMmHr: 60.5 },
      { timeOffsetMin: 90, intensityMmHr: 52.0 },
      { timeOffsetMin: 105, intensityMmHr: 44.0 },
      { timeOffsetMin: 120, intensityMmHr: 36.5 },
      { timeOffsetMin: 135, intensityMmHr: 28.0 },
      { timeOffsetMin: 150, intensityMmHr: 21.0 },
      { timeOffsetMin: 165, intensityMmHr: 16.5 },
      { timeOffsetMin: 180, intensityMmHr: 12.0 }
    ]
  },
  {
    id: 'cloudburst_flash',
    name: 'Demo: Sudden Urban Cloudburst',
    description: 'Simulated extreme localized cloudburst downpour exceeding stormwater capacity.',
    source: 'simulated',
    intensityMmHr: 86.0,
    cum1hMm: 86.0,
    cum3hMm: 95.0,
    cum6hMm: 110.0,
    radarDbz: 56.4,
    stationName: 'Demo Simulation (Convective Cell)',
    timestamp: 'Demo Scenario',
    forecastCurve: [
      { timeOffsetMin: 0, intensityMmHr: 86.0 },
      { timeOffsetMin: 15, intensityMmHr: 94.0 },
      { timeOffsetMin: 30, intensityMmHr: 98.0 },
      { timeOffsetMin: 45, intensityMmHr: 72.0 },
      { timeOffsetMin: 60, intensityMmHr: 50.0 },
      { timeOffsetMin: 75, intensityMmHr: 35.0 },
      { timeOffsetMin: 90, intensityMmHr: 24.0 },
      { timeOffsetMin: 105, intensityMmHr: 18.0 },
      { timeOffsetMin: 120, intensityMmHr: 12.0 },
      { timeOffsetMin: 135, intensityMmHr: 8.0 },
      { timeOffsetMin: 150, intensityMmHr: 5.0 },
      { timeOffsetMin: 165, intensityMmHr: 3.0 },
      { timeOffsetMin: 180, intensityMmHr: 2.0 }
    ]
  },
  {
    id: 'receding_post_storm',
    name: 'Demo: Post-Storm Receding Waters',
    description: 'Simulated post-storm receding phase; rain tapered off, stormwater drains pumping.',
    source: 'simulated',
    intensityMmHr: 12.0,
    cum1hMm: 18.0,
    cum3hMm: 88.0,
    cum6hMm: 164.0,
    radarDbz: 32.8,
    stationName: 'Demo Simulation (Post-Storm)',
    timestamp: 'Demo Scenario',
    forecastCurve: [
      { timeOffsetMin: 0, intensityMmHr: 12.0 },
      { timeOffsetMin: 15, intensityMmHr: 9.5 },
      { timeOffsetMin: 30, intensityMmHr: 7.0 },
      { timeOffsetMin: 45, intensityMmHr: 5.0 },
      { timeOffsetMin: 60, intensityMmHr: 3.5 },
      { timeOffsetMin: 75, intensityMmHr: 2.0 },
      { timeOffsetMin: 90, intensityMmHr: 1.0 },
      { timeOffsetMin: 105, intensityMmHr: 0.5 },
      { timeOffsetMin: 120, intensityMmHr: 0.2 },
      { timeOffsetMin: 135, intensityMmHr: 0.0 },
      { timeOffsetMin: 150, intensityMmHr: 0.0 },
      { timeOffsetMin: 165, intensityMmHr: 0.0 },
      { timeOffsetMin: 180, intensityMmHr: 0.0 }
    ]
  }
];

// Base Street networks for Mumbai, Delhi, and Chennai
export const BASE_STREETS: Record<CityId, StreetFeature[]> = {
  mumbai: [
    {
      id: 'mum_hindmata',
      name: 'Hindmata Junction & Dr. B.A. Road',
      neighborhood: 'Dadar East / Parel',
      cityId: 'mumbai',
      coordinates: [
        [19.0112, 72.8445],
        [19.0128, 72.8448],
        [19.0146, 72.8451],
        [19.0165, 72.8456]
      ],
      demElevationM: 4.1,
      slopePercent: 0.4,
      depressionIndex: 0.94,
      imperviousPercent: 92,
      drainageDensityMPerHa: 42,
      pipeCapacityM3s: 1.8,
      historicalIncidentsCount: 38,
      distanceToDrainM: 35,
      distanceToWaterbodyM: 1400,
      nearestDrainNodeId: 'node_mum_hindmata_sump',
      forecast: []
    },
    {
      id: 'mum_milan_subway',
      name: 'Milan Subway Underpass',
      neighborhood: 'Santacruz West - Vile Parle',
      cityId: 'mumbai',
      coordinates: [
        [19.0842, 72.8402],
        [19.0851, 72.8415],
        [19.0862, 72.8431],
        [19.0870, 72.8446]
      ],
      demElevationM: 3.2,
      slopePercent: 3.8,
      depressionIndex: 0.98,
      imperviousPercent: 95,
      drainageDensityMPerHa: 38,
      pipeCapacityM3s: 2.1,
      historicalIncidentsCount: 44,
      distanceToDrainM: 20,
      distanceToWaterbodyM: 1100,
      nearestDrainNodeId: 'node_mum_milan_pump',
      forecast: []
    },
    {
      id: 'mum_gandhi_market',
      name: 'Gandhi Market (Kingsway & Dr. Ambedkar Rd)',
      neighborhood: 'Matunga East / King’s Circle',
      cityId: 'mumbai',
      coordinates: [
        [19.0298, 72.8582],
        [19.0315, 72.8589],
        [19.0331, 72.8596],
        [19.0348, 72.8604]
      ],
      demElevationM: 4.8,
      slopePercent: 0.6,
      depressionIndex: 0.89,
      imperviousPercent: 88,
      drainageDensityMPerHa: 48,
      pipeCapacityM3s: 2.4,
      historicalIncidentsCount: 32,
      distanceToDrainM: 40,
      distanceToWaterbodyM: 1200,
      nearestDrainNodeId: 'node_mum_kings_circle',
      forecast: []
    },
    {
      id: 'mum_kings_circle',
      name: 'King’s Circle / Maheshwari Udyan',
      neighborhood: 'Matunga Central',
      cityId: 'mumbai',
      coordinates: [
        [19.0270, 72.8550],
        [19.0285, 72.8568],
        [19.0302, 72.8585],
        [19.0318, 72.8601]
      ],
      demElevationM: 4.5,
      slopePercent: 0.5,
      depressionIndex: 0.91,
      imperviousPercent: 90,
      drainageDensityMPerHa: 45,
      pipeCapacityM3s: 2.2,
      historicalIncidentsCount: 35,
      distanceToDrainM: 35,
      distanceToWaterbodyM: 1300,
      nearestDrainNodeId: 'node_mum_kings_circle',
      forecast: []
    },
    {
      id: 'mum_andheri_subway',
      name: 'Andheri Subway (S.V. Road link)',
      neighborhood: 'Andheri West',
      cityId: 'mumbai',
      coordinates: [
        [19.1174, 72.8455],
        [19.1186, 72.8471],
        [19.1194, 72.8488]
      ],
      demElevationM: 3.6,
      slopePercent: 4.2,
      depressionIndex: 0.96,
      imperviousPercent: 94,
      drainageDensityMPerHa: 34,
      pipeCapacityM3s: 1.6,
      historicalIncidentsCount: 41,
      distanceToDrainM: 15,
      distanceToWaterbodyM: 1800,
      nearestDrainNodeId: 'node_mum_andheri_sump',
      forecast: []
    },
    {
      id: 'mum_lbs_kurla',
      name: 'L.B.S. Marg (Kamani - Kurla Depot)',
      neighborhood: 'Kurla West',
      cityId: 'mumbai',
      coordinates: [
        [19.0682, 72.8795],
        [19.0712, 72.8812],
        [19.0745, 72.8834],
        [19.0776, 72.8856]
      ],
      demElevationM: 5.2,
      slopePercent: 0.8,
      depressionIndex: 0.85,
      imperviousPercent: 91,
      drainageDensityMPerHa: 36,
      pipeCapacityM3s: 2.8,
      historicalIncidentsCount: 36,
      distanceToDrainM: 50,
      distanceToWaterbodyM: 320, // adjacent to Mithi River
      nearestDrainNodeId: 'node_mum_mithi_outfall',
      forecast: []
    },
    {
      id: 'mum_bkc_connector',
      name: 'BKC Boulevard & Kalanagar Flyover',
      neighborhood: 'Bandra East',
      cityId: 'mumbai',
      coordinates: [
        [19.0601, 72.8524],
        [19.0632, 72.8586],
        [19.0664, 72.8648],
        [19.0678, 72.8710]
      ],
      demElevationM: 7.9,
      slopePercent: 1.2,
      depressionIndex: 0.32,
      imperviousPercent: 78,
      drainageDensityMPerHa: 68,
      pipeCapacityM3s: 5.2,
      historicalIncidentsCount: 8,
      distanceToDrainM: 25,
      distanceToWaterbodyM: 450,
      nearestDrainNodeId: 'node_mum_bkc_box_drain',
      forecast: []
    },
    {
      id: 'mum_dadar_tt',
      name: 'Dadar T.T. Circle & Tilak Bridge',
      neighborhood: 'Dadar Central',
      cityId: 'mumbai',
      coordinates: [
        [19.0155, 72.8465],
        [19.0178, 72.8478],
        [19.0205, 72.8492]
      ],
      demElevationM: 7.2,
      slopePercent: 1.5,
      depressionIndex: 0.38,
      imperviousPercent: 86,
      drainageDensityMPerHa: 52,
      pipeCapacityM3s: 3.5,
      historicalIncidentsCount: 14,
      distanceToDrainM: 45,
      distanceToWaterbodyM: 1900,
      nearestDrainNodeId: 'node_mum_dadar_junction',
      forecast: []
    },
    {
      id: 'mum_sion_circle',
      name: 'Sion Circle & Sion-Panvel Highway',
      neighborhood: 'Sion',
      cityId: 'mumbai',
      coordinates: [
        [19.0360, 72.8590],
        [19.0385, 72.8620],
        [19.0410, 72.8655]
      ],
      demElevationM: 5.5,
      slopePercent: 0.9,
      depressionIndex: 0.72,
      imperviousPercent: 89,
      drainageDensityMPerHa: 44,
      pipeCapacityM3s: 3.0,
      historicalIncidentsCount: 27,
      distanceToDrainM: 30,
      distanceToWaterbodyM: 850,
      nearestDrainNodeId: 'node_mum_sion_culvert',
      forecast: []
    },
    {
      id: 'mum_kem_corridor',
      name: 'Acharya Donde Marg (KEM Hospital Access)',
      neighborhood: 'Parel',
      cityId: 'mumbai',
      coordinates: [
        [19.0010, 72.8390],
        [19.0028, 72.8427],
        [19.0042, 72.8455]
      ],
      demElevationM: 8.4,
      slopePercent: 1.8,
      depressionIndex: 0.25,
      imperviousPercent: 82,
      drainageDensityMPerHa: 62,
      pipeCapacityM3s: 4.1,
      historicalIncidentsCount: 6,
      distanceToDrainM: 35,
      distanceToWaterbodyM: 2200,
      nearestDrainNodeId: 'node_mum_parel_drain',
      forecast: []
    },
    {
      id: 'mum_senapati_bapat',
      name: 'Senapati Bapat Marg (Lower Parel - Dadar)',
      neighborhood: 'Elphinstone / Lower Parel',
      cityId: 'mumbai',
      coordinates: [
        [18.9950, 72.8285],
        [19.0040, 72.8340],
        [19.0125, 72.8395],
        [19.0200, 72.8435]
      ],
      demElevationM: 6.8,
      slopePercent: 1.1,
      depressionIndex: 0.45,
      imperviousPercent: 89,
      drainageDensityMPerHa: 55,
      pipeCapacityM3s: 3.8,
      historicalIncidentsCount: 16,
      distanceToDrainM: 40,
      distanceToWaterbodyM: 1500,
      nearestDrainNodeId: 'node_mum_elphinstone',
      forecast: []
    },
    {
      id: 'mum_mahim_causeway',
      name: 'Mahim Causeway Coastal Roadway',
      neighborhood: 'Mahim West - Bandra',
      cityId: 'mumbai',
      coordinates: [
        [19.0380, 72.8390],
        [19.0436, 72.8419],
        [19.0505, 72.8425]
      ],
      demElevationM: 6.2,
      slopePercent: 0.8,
      depressionIndex: 0.52,
      imperviousPercent: 84,
      drainageDensityMPerHa: 50,
      pipeCapacityM3s: 4.5,
      historicalIncidentsCount: 19,
      distanceToDrainM: 60,
      distanceToWaterbodyM: 120, // Coastal creek
      nearestDrainNodeId: 'node_mum_mahim_creek_gate',
      forecast: []
    },
    {
      id: 'mum_sv_road_khar',
      name: 'Swami Vivekanand (S.V.) Road Khar',
      neighborhood: 'Khar West - Bandra',
      cityId: 'mumbai',
      coordinates: [
        [19.0620, 72.8350],
        [19.0710, 72.8380],
        [19.0800, 72.8395]
      ],
      demElevationM: 6.0,
      slopePercent: 0.9,
      depressionIndex: 0.61,
      imperviousPercent: 88,
      drainageDensityMPerHa: 46,
      pipeCapacityM3s: 3.2,
      historicalIncidentsCount: 22,
      distanceToDrainM: 40,
      distanceToWaterbodyM: 950,
      nearestDrainNodeId: 'node_mum_khar_drain',
      forecast: []
    },
    {
      id: 'mum_chembur',
      name: 'Chembur Postal Colony & VN Purav Marg',
      neighborhood: 'Chembur East',
      cityId: 'mumbai',
      coordinates: [
        [19.0520, 72.8980],
        [19.0555, 72.9015],
        [19.0590, 72.9050],
        [19.0620, 72.9080]
      ],
      demElevationM: 6.2,
      slopePercent: 0.8,
      depressionIndex: 0.68,
      imperviousPercent: 86,
      drainageDensityMPerHa: 44,
      pipeCapacityM3s: 2.9,
      historicalIncidentsCount: 24,
      distanceToDrainM: 35,
      distanceToWaterbodyM: 1100,
      nearestDrainNodeId: 'node_mum_sion_culvert',
      forecast: []
    }
  ],
  delhi: [
    {
      id: 'del_minto_bridge',
      name: 'Minto Bridge Underpass',
      neighborhood: 'Connaught Place South',
      cityId: 'delhi',
      coordinates: [
        [28.6360, 77.2255],
        [28.6375, 77.2268],
        [28.6392, 77.2280]
      ],
      demElevationM: 206.2,
      slopePercent: 4.8,
      depressionIndex: 0.97,
      imperviousPercent: 96,
      drainageDensityMPerHa: 35,
      pipeCapacityM3s: 2.2,
      historicalIncidentsCount: 42,
      distanceToDrainM: 18,
      distanceToWaterbodyM: 2400,
      nearestDrainNodeId: 'node_del_minto_pump',
      forecast: []
    },
    {
      id: 'del_ito_junction',
      name: 'ITO Junction & Vikas Marg',
      neighborhood: 'Indraprastha / ITO',
      cityId: 'delhi',
      coordinates: [
        [28.6275, 77.2405],
        [28.6290, 77.2440],
        [28.6305, 77.2485],
        [28.6318, 77.2520]
      ],
      demElevationM: 207.8,
      slopePercent: 0.5,
      depressionIndex: 0.88,
      imperviousPercent: 92,
      drainageDensityMPerHa: 40,
      pipeCapacityM3s: 3.1,
      historicalIncidentsCount: 31,
      distanceToDrainM: 35,
      distanceToWaterbodyM: 400, // Yamuna River corridor
      nearestDrainNodeId: 'node_del_ito_barrage_drain',
      forecast: []
    },
    {
      id: 'del_pragati_bhairon',
      name: 'Bhairon Marg & Mathura Road Underpass',
      neighborhood: 'Pragati Maidan',
      cityId: 'delhi',
      coordinates: [
        [28.6140, 77.2410],
        [28.6165, 77.2445],
        [28.6190, 77.2480]
      ],
      demElevationM: 208.5,
      slopePercent: 2.9,
      depressionIndex: 0.84,
      imperviousPercent: 93,
      drainageDensityMPerHa: 42,
      pipeCapacityM3s: 2.7,
      historicalIncidentsCount: 26,
      distanceToDrainM: 25,
      distanceToWaterbodyM: 650,
      nearestDrainNodeId: 'node_del_bhairon_pump',
      forecast: []
    },
    {
      id: 'del_kashmere_gate',
      name: 'Ring Road at Kashmere Gate ISBT',
      neighborhood: 'Civil Lines / Kashmere Gate',
      cityId: 'delhi',
      coordinates: [
        [28.6650, 77.2270],
        [28.6675, 77.2289],
        [28.6705, 77.2315]
      ],
      demElevationM: 206.9,
      slopePercent: 0.7,
      depressionIndex: 0.89,
      imperviousPercent: 90,
      drainageDensityMPerHa: 38,
      pipeCapacityM3s: 3.4,
      historicalIncidentsCount: 35,
      distanceToDrainM: 45,
      distanceToWaterbodyM: 300, // Yamuna bank
      nearestDrainNodeId: 'node_del_yamuna_gate',
      forecast: []
    },
    {
      id: 'del_pul_prahladpur',
      name: 'Pul Prahladpur Underpass (MB Road)',
      neighborhood: 'Tughlakabad / Badarpur',
      cityId: 'delhi',
      coordinates: [
        [28.5080, 77.2840],
        [28.5105, 77.2870],
        [28.5130, 77.2905]
      ],
      demElevationM: 211.0,
      slopePercent: 3.9,
      depressionIndex: 0.95,
      imperviousPercent: 92,
      drainageDensityMPerHa: 32,
      pipeCapacityM3s: 1.9,
      historicalIncidentsCount: 39,
      distanceToDrainM: 30,
      distanceToWaterbodyM: 2100,
      nearestDrainNodeId: 'node_del_prahladpur_sump',
      forecast: []
    },
    {
      id: 'del_ring_road_aiims',
      name: 'Mahatma Gandhi Ring Road (AIIMS corridor)',
      neighborhood: 'Ansari Nagar / Safdarjung',
      cityId: 'delhi',
      coordinates: [
        [28.5650, 77.2040],
        [28.5672, 77.2100],
        [28.5695, 77.2170],
        [28.5718, 77.2245]
      ],
      demElevationM: 219.4,
      slopePercent: 1.4,
      depressionIndex: 0.22,
      imperviousPercent: 78,
      drainageDensityMPerHa: 66,
      pipeCapacityM3s: 5.6,
      historicalIncidentsCount: 7,
      distanceToDrainM: 30,
      distanceToWaterbodyM: 3800,
      nearestDrainNodeId: 'node_del_aiims_box_drain',
      forecast: []
    },
    {
      id: 'del_barapullah_elevated',
      name: 'Barapullah Elevated Corridor & Sarai Kale Khan',
      neighborhood: 'Nizamuddin East',
      cityId: 'delhi',
      coordinates: [
        [28.5820, 77.2450],
        [28.5875, 77.2530],
        [28.5910, 77.2600]
      ],
      demElevationM: 212.0,
      slopePercent: 1.1,
      depressionIndex: 0.42,
      imperviousPercent: 83,
      drainageDensityMPerHa: 54,
      pipeCapacityM3s: 4.8,
      historicalIncidentsCount: 15,
      distanceToDrainM: 20,
      distanceToWaterbodyM: 150, // Barapullah Nallah
      nearestDrainNodeId: 'node_del_barapullah_nallah',
      forecast: []
    },
    {
      id: 'del_connaught_outer',
      name: 'Connaught Circus Outer Ring',
      neighborhood: 'Central Delhi',
      cityId: 'delhi',
      coordinates: [
        [28.6290, 77.2140],
        [28.6315, 77.2167],
        [28.6340, 77.2200],
        [28.6320, 77.2230]
      ],
      demElevationM: 216.5,
      slopePercent: 0.8,
      depressionIndex: 0.35,
      imperviousPercent: 87,
      drainageDensityMPerHa: 58,
      pipeCapacityM3s: 4.2,
      historicalIncidentsCount: 11,
      distanceToDrainM: 40,
      distanceToWaterbodyM: 2800,
      nearestDrainNodeId: 'node_del_cp_trunk',
      forecast: []
    },
    {
      id: 'del_dhaula_kuan',
      name: 'Dhaula Kuan Arterial Interchange',
      neighborhood: 'South West Delhi',
      cityId: 'delhi',
      coordinates: [
        [28.5910, 77.1580],
        [28.5935, 77.1645],
        [28.5960, 77.1700]
      ],
      demElevationM: 231.0,
      slopePercent: 2.1,
      depressionIndex: 0.18,
      imperviousPercent: 74,
      drainageDensityMPerHa: 62,
      pipeCapacityM3s: 5.0,
      historicalIncidentsCount: 4,
      distanceToDrainM: 50,
      distanceToWaterbodyM: 4200,
      nearestDrainNodeId: 'node_del_dhaula_kuan_trunk',
      forecast: []
    },
    {
      id: 'del_zakhira_flyover',
      name: 'Rohtak Road under Zakhira Flyover',
      neighborhood: 'West Delhi / Anand Parbat',
      cityId: 'delhi',
      coordinates: [
        [28.6620, 77.1630],
        [28.6650, 77.1670],
        [28.6680, 77.1710]
      ],
      demElevationM: 211.2,
      slopePercent: 2.5,
      depressionIndex: 0.82,
      imperviousPercent: 91,
      drainageDensityMPerHa: 36,
      pipeCapacityM3s: 2.5,
      historicalIncidentsCount: 29,
      distanceToDrainM: 40,
      distanceToWaterbodyM: 800, // Najafgarh canal branch
      nearestDrainNodeId: 'node_del_zakhira_pump',
      forecast: []
    }
  ],
  chennai: [
    {
      id: 'che_velachery_main',
      name: 'Velachery Main Road & Lake Junction',
      neighborhood: 'Velachery',
      cityId: 'chennai',
      coordinates: [
        [12.9750, 80.2150],
        [12.9820, 80.2185],
        [12.9890, 80.2215],
        [12.9960, 80.2235]
      ],
      demElevationM: 2.9,
      slopePercent: 0.3,
      depressionIndex: 0.95,
      imperviousPercent: 93,
      drainageDensityMPerHa: 36,
      pipeCapacityM3s: 2.2,
      historicalIncidentsCount: 46,
      distanceToDrainM: 25,
      distanceToWaterbodyM: 180, // Velachery Lake / Pallikaranai marsh
      nearestDrainNodeId: 'node_che_velachery_marsh_sluice',
      forecast: []
    },
    {
      id: 'che_usman_road',
      name: 'Usman Road & Panagal Park',
      neighborhood: 'T. Nagar Commercial Core',
      cityId: 'chennai',
      coordinates: [
        [13.0360, 80.2310],
        [13.0416, 80.2335],
        [13.0475, 80.2360]
      ],
      demElevationM: 4.8,
      slopePercent: 0.5,
      depressionIndex: 0.88,
      imperviousPercent: 96,
      drainageDensityMPerHa: 42,
      pipeCapacityM3s: 2.6,
      historicalIncidentsCount: 37,
      distanceToDrainM: 35,
      distanceToWaterbodyM: 1400, // Mambalam Canal
      nearestDrainNodeId: 'node_che_mambalam_canal',
      forecast: []
    },
    {
      id: 'che_madipakkam_lake',
      name: 'Madipakkam Lake Road / Puzhuthivakkam',
      neighborhood: 'Madipakkam',
      cityId: 'chennai',
      coordinates: [
        [12.9620, 80.1980],
        [12.9660, 80.2015],
        [12.9705, 80.2050]
      ],
      demElevationM: 3.4,
      slopePercent: 0.4,
      depressionIndex: 0.93,
      imperviousPercent: 90,
      drainageDensityMPerHa: 34,
      pipeCapacityM3s: 1.9,
      historicalIncidentsCount: 40,
      distanceToDrainM: 30,
      distanceToWaterbodyM: 120,
      nearestDrainNodeId: 'node_che_madipakkam_weir',
      forecast: []
    },
    {
      id: 'che_mudichur_road',
      name: 'Mudichur Road & Kishkinta Link',
      neighborhood: 'Mudichur / West Tambaram',
      cityId: 'chennai',
      coordinates: [
        [12.9200, 80.0880],
        [12.9260, 80.0930],
        [12.9320, 80.0980]
      ],
      demElevationM: 3.1,
      slopePercent: 0.4,
      depressionIndex: 0.94,
      imperviousPercent: 88,
      drainageDensityMPerHa: 30,
      pipeCapacityM3s: 2.0,
      historicalIncidentsCount: 43,
      distanceToDrainM: 40,
      distanceToWaterbodyM: 250, // Adyar River tributary
      nearestDrainNodeId: 'node_che_adyar_basin_spill',
      forecast: []
    },
    {
      id: 'che_gst_kathipara',
      name: 'Grand Southern Trunk (GST) Road - Kathipara',
      neighborhood: 'Guindy / Alandur',
      cityId: 'chennai',
      coordinates: [
        [13.0020, 80.2000],
        [13.0076, 80.2031],
        [13.0130, 80.2065]
      ],
      demElevationM: 7.2,
      slopePercent: 1.3,
      depressionIndex: 0.35,
      imperviousPercent: 84,
      drainageDensityMPerHa: 60,
      pipeCapacityM3s: 4.8,
      historicalIncidentsCount: 12,
      distanceToDrainM: 40,
      distanceToWaterbodyM: 1100,
      nearestDrainNodeId: 'node_che_kathipara_drain',
      forecast: []
    },
    {
      id: 'che_vyasarpadi_subway',
      name: 'Vyasarpadi Ganesapuram Subway',
      neighborhood: 'Vyasarpadi / Perambur',
      cityId: 'chennai',
      coordinates: [
        [13.1110, 80.2580],
        [13.1140, 80.2605],
        [13.1170, 80.2635]
      ],
      demElevationM: 2.2,
      slopePercent: 4.5,
      depressionIndex: 0.99,
      imperviousPercent: 95,
      drainageDensityMPerHa: 30,
      pipeCapacityM3s: 1.5,
      historicalIncidentsCount: 48,
      distanceToDrainM: 15,
      distanceToWaterbodyM: 450, // Otteri Nullah
      nearestDrainNodeId: 'node_che_vyasarpadi_pump',
      forecast: []
    },
    {
      id: 'che_anna_salai_thousand',
      name: 'Anna Salai (Thousand Lights - Gemini Circle)',
      neighborhood: 'Teynampet / Thousand Lights',
      cityId: 'chennai',
      coordinates: [
        [13.0510, 80.2480],
        [13.0560, 80.2520],
        [13.0610, 80.2560]
      ],
      demElevationM: 8.5,
      slopePercent: 1.1,
      depressionIndex: 0.28,
      imperviousPercent: 86,
      drainageDensityMPerHa: 64,
      pipeCapacityM3s: 4.5,
      historicalIncidentsCount: 9,
      distanceToDrainM: 35,
      distanceToWaterbodyM: 1600,
      nearestDrainNodeId: 'node_che_anna_salai_trunk',
      forecast: []
    },
    {
      id: 'che_cooum_evr_periyar',
      name: 'EVR Periyar Salai (Poonamallee High Road)',
      neighborhood: 'Kilpauk - Central',
      cityId: 'chennai',
      coordinates: [
        [13.0780, 80.2550],
        [13.0805, 80.2660],
        [13.0827, 80.2755]
      ],
      demElevationM: 6.8,
      slopePercent: 0.8,
      depressionIndex: 0.44,
      imperviousPercent: 90,
      drainageDensityMPerHa: 52,
      pipeCapacityM3s: 3.9,
      historicalIncidentsCount: 16,
      distanceToDrainM: 30,
      distanceToWaterbodyM: 300, // Cooum River
      nearestDrainNodeId: 'node_che_cooum_sluice',
      forecast: []
    },
    {
      id: 'che_greams_road_apollo',
      name: 'Greams Road (Apollo Hospital Corridor)',
      neighborhood: 'Thousand Lights',
      cityId: 'chennai',
      coordinates: [
        [13.0565, 80.2485],
        [13.0583, 80.2526],
        [13.0605, 80.2565]
      ],
      demElevationM: 7.8,
      slopePercent: 1.2,
      depressionIndex: 0.31,
      imperviousPercent: 85,
      drainageDensityMPerHa: 60,
      pipeCapacityM3s: 4.2,
      historicalIncidentsCount: 8,
      distanceToDrainM: 25,
      distanceToWaterbodyM: 1200,
      nearestDrainNodeId: 'node_che_greams_drain',
      forecast: []
    },
    {
      id: 'che_kamarajar_promenade',
      name: 'Kamarajar Salai (Marina Beach Road)',
      neighborhood: 'Mylapore / Triplicane Coastal',
      cityId: 'chennai',
      coordinates: [
        [13.0420, 80.2810],
        [13.0500, 80.2824],
        [13.0590, 80.2835]
      ],
      demElevationM: 5.6,
      slopePercent: 0.6,
      depressionIndex: 0.50,
      imperviousPercent: 82,
      drainageDensityMPerHa: 50,
      pipeCapacityM3s: 4.0,
      historicalIncidentsCount: 18,
      distanceToDrainM: 50,
      distanceToWaterbodyM: 80, // Bay of Bengal coastal edge
      nearestDrainNodeId: 'node_che_marina_outfall',
      forecast: []
    }
  ]
};

// Drainage infrastructure networks
export const DRAINAGE_NETWORKS: Record<CityId, DrainageNetwork> = {
  mumbai: { nodes: [], edges: [], overallUtilizationPercent: 0, surchargingNodesCount: 0, activePumpsCount: 0 },
  delhi: { nodes: [], edges: [], overallUtilizationPercent: 0, surchargingNodesCount: 0, activePumpsCount: 0 },
  chennai: { nodes: [], edges: [], overallUtilizationPercent: 0, surchargingNodesCount: 0, activePumpsCount: 0 }
};
