/**
 * Realistic Mock Data & Constants for FloodGuard (Mumbai Metropolitan Region)
 */

export interface FloodArea {
  id: string;
  name: string;
  locality: string;
  category: 'subway' | 'road' | 'low-lying';
  depthCm: number;
  maxDepthCm: number;
  status: 'severe' | 'high' | 'moderate' | 'safe';
  trend: 'rising' | 'falling' | 'stable';
  trendRateCm: number; // change per 15 min
  expectedPeakMin: number;
  coordinates: [number, number];
  alternateRoute: string;
  description: string;
  nearestHospital: string;
  hospitalDistanceKm: number;
  updatedMinsAgo: number;
}

export interface ForecastPoint {
  timeLabel: string;
  offsetMin: number;
  depthCm: number;
  rainfallMmHr: number;
  isPeak?: boolean;
  annotation?: string;
}

export interface LanguageStrings {
  alertTitle: string;
  alertDesc: string;
  findSafeRoute: string;
  viewMap: string;
  currentRisk: string;
  maxDepth: string;
  rainRate: string;
  areasToAvoid: string;
  whatIsHappening: string;
  whatShouldIDo: string;
  askAi: string;
  emergencyMode: string;
  shareAlert: string;
  emergencySos: string;
}

export const MUMBAI_FLOOD_AREAS: FloodArea[] = [
  {
    id: 'hindmata',
    name: 'Hindmata Junction',
    locality: 'Dadar East / Parel',
    category: 'subway',
    depthCm: 145,
    maxDepthCm: 148,
    status: 'severe',
    trend: 'rising',
    trendRateCm: 6,
    expectedPeakMin: 45,
    coordinates: [19.0128, 72.8448],
    alternateRoute: 'Use Dr. B.A. Road Elevated Flyover instead of surface lanes.',
    description: 'Chronic bowl depression basin experiencing severe storm runoff accumulation. Surface lanes completely impassable.',
    nearestHospital: 'KEM Hospital (Parel)',
    hospitalDistanceKm: 0.8,
    updatedMinsAgo: 2
  },
  {
    id: 'milan_subway',
    name: 'Milan Subway Underpass',
    locality: 'Santacruz West - Vile Parle',
    category: 'subway',
    depthCm: 118,
    maxDepthCm: 125,
    status: 'severe',
    trend: 'rising',
    trendRateCm: 8,
    expectedPeakMin: 30,
    coordinates: [19.0851, 72.8415],
    alternateRoute: 'Take Santacruz Rail Overbridge (ROB) via SV Road to Western Express Highway.',
    description: 'Underpass sump inundated. Barricades deployed by Mumbai Traffic Police. Strict vehicle exclusion.',
    nearestHospital: 'Nanavati Hospital (Vile Parle)',
    hospitalDistanceKm: 1.4,
    updatedMinsAgo: 3
  },
  {
    id: 'andheri_subway',
    name: 'Andheri Subway',
    locality: 'Andheri West (S.V. Road Link)',
    category: 'subway',
    depthCm: 92,
    maxDepthCm: 98,
    status: 'severe',
    trend: 'rising',
    trendRateCm: 5,
    expectedPeakMin: 35,
    coordinates: [19.1186, 72.8471],
    alternateRoute: 'Divert via Gokhale Bridge or Balasaheb Thackeray Flyover.',
    description: 'High water levels exceeding 90 cm. Light motor vehicles and auto-rickshaws barred.',
    nearestHospital: 'Kokilaben Dhirubhai Ambani Hospital',
    hospitalDistanceKm: 2.1,
    updatedMinsAgo: 1
  },
  {
    id: 'gandhi_market',
    name: 'Gandhi Market & King’s Circle',
    locality: 'Matunga East',
    category: 'low-lying',
    depthCm: 68,
    maxDepthCm: 75,
    status: 'high',
    trend: 'rising',
    trendRateCm: 4,
    expectedPeakMin: 40,
    coordinates: [19.0315, 72.8589],
    alternateRoute: 'Use Eastern Express Highway or Tilak Bridge Dadar.',
    description: 'Holding sump tanks at 92% capacity. Water accumulating on market approach roads.',
    nearestHospital: 'Sion Hospital (LTMMC)',
    hospitalDistanceKm: 1.1,
    updatedMinsAgo: 4
  },
  {
    id: 'kurla_lbs',
    name: 'L.B.S. Marg (Kamani - Kurla)',
    locality: 'Kurla West (Mithi River Basin)',
    category: 'road',
    depthCm: 54,
    maxDepthCm: 60,
    status: 'high',
    trend: 'rising',
    trendRateCm: 3,
    expectedPeakMin: 50,
    coordinates: [19.0712, 72.8812],
    alternateRoute: 'Divert via Santacruz-Chembur Link Road (SCLR) elevated corridor.',
    description: 'Adjacent Mithi river outfall experiencing high tide backflow, slowing stormwater drainage.',
    nearestHospital: 'Kurla Bhabha Hospital',
    hospitalDistanceKm: 1.6,
    updatedMinsAgo: 2
  },
  {
    id: 'sion_circle',
    name: 'Sion Circle & Road No. 24',
    locality: 'Sion Central',
    category: 'road',
    depthCm: 38,
    maxDepthCm: 45,
    status: 'high',
    trend: 'stable',
    trendRateCm: 0,
    expectedPeakMin: 60,
    coordinates: [19.0385, 72.8620],
    alternateRoute: 'Use Sion Flyover directly connecting to Chunabhatti.',
    description: 'Water depth 38 cm near railway colony junction. Buses operating with delays.',
    nearestHospital: 'Sion Hospital (LTMMC)',
    hospitalDistanceKm: 0.5,
    updatedMinsAgo: 5
  },
  {
    id: 'bkc_connector',
    name: 'BKC Boulevard (Kalanagar)',
    locality: 'Bandra East',
    category: 'road',
    depthCm: 22,
    maxDepthCm: 28,
    status: 'moderate',
    trend: 'falling',
    trendRateCm: -2,
    expectedPeakMin: 15,
    coordinates: [19.0632, 72.8586],
    alternateRoute: 'Main BKC Elevated Corridor is clear; surface bypass has minor pooling.',
    description: 'High capacity stormwater box drain active. Water draining steadily.',
    nearestHospital: 'Asian Heart Institute (BKC)',
    hospitalDistanceKm: 1.2,
    updatedMinsAgo: 3
  },
  {
    id: 'dadar_tt',
    name: 'Dadar T.T. Circle',
    locality: 'Dadar Central',
    category: 'low-lying',
    depthCm: 18,
    maxDepthCm: 22,
    status: 'moderate',
    trend: 'falling',
    trendRateCm: -3,
    expectedPeakMin: 10,
    coordinates: [19.0178, 72.8478],
    alternateRoute: 'Tilak Bridge and Senapati Bapat Marg operating with moderate speed.',
    description: 'Surface runoff manageable. Passenger cars moving slowly.',
    nearestHospital: 'Hinduja Hospital (Mahim)',
    hospitalDistanceKm: 2.0,
    updatedMinsAgo: 4
  },
  {
    id: 'mahim_causeway',
    name: 'Mahim Causeway Corridor',
    locality: 'Mahim - Bandra Border',
    category: 'road',
    depthCm: 14,
    maxDepthCm: 18,
    status: 'moderate',
    trend: 'stable',
    trendRateCm: 0,
    expectedPeakMin: 20,
    coordinates: [19.0436, 72.8419],
    alternateRoute: 'Bandra-Worli Sea Link is fully open with normal speed limit.',
    description: 'Coastal spray and minor curb waterlogging. All lanes operational.',
    nearestHospital: 'Lilavati Hospital (Bandra)',
    hospitalDistanceKm: 1.8,
    updatedMinsAgo: 5
  }
];

export const MUMBAI_HOSPITALS = [
  { name: 'KEM Hospital & Medical College', locality: 'Parel', coordinates: [19.0028, 72.8427], tier: 'Level-1 Apex Trauma', openRoute: 'via Dr. B.A. Road Flyover' },
  { name: 'Lilavati Hospital & Research Centre', locality: 'Bandra West', coordinates: [19.0514, 72.8291], tier: 'Super-Specialty Emergency', openRoute: 'via Bandra-Worli Sea Link' },
  { name: 'P.D. Hinduja National Hospital', locality: 'Mahim', coordinates: [19.0335, 72.8391], tier: 'Cardiac & Acute Trauma', openRoute: 'via Veer Savarkar Marg' },
  { name: 'Nanavati Max Super Speciality Hospital', locality: 'Vile Parle', coordinates: [19.0967, 72.8415], tier: 'Critical Care Facility', openRoute: 'via Western Express Highway' },
  { name: 'Lokmanya Tilak Municipal General Hospital (Sion)', locality: 'Sion', coordinates: [19.0375, 72.8612], tier: 'Civic Disaster Trauma Hub', openRoute: 'via Eastern Express Highway' }
];

export const THREE_HOUR_FORECAST: ForecastPoint[] = [
  { timeLabel: 'Now', offsetMin: 0, depthCm: 145, rainfallMmHr: 58.5 },
  { timeLabel: '+15 min', offsetMin: 15, depthCm: 148, rainfallMmHr: 67.0 },
  { timeLabel: '+30 min', offsetMin: 30, depthCm: 152, rainfallMmHr: 76.5 },
  { timeLabel: '+45 min', offsetMin: 45, depthCm: 154, rainfallMmHr: 82.0, isPeak: true, annotation: 'Peak Catchment Surge (T+45m)' },
  { timeLabel: '+1 hr', offsetMin: 60, depthCm: 138, rainfallMmHr: 71.0 },
  { timeLabel: '+1.5 hr', offsetMin: 90, depthCm: 104, rainfallMmHr: 52.0, annotation: 'Expected to recede after 1h' },
  { timeLabel: '+2 hr', offsetMin: 120, depthCm: 68, rainfallMmHr: 36.5 },
  { timeLabel: '+2.5 hr', offsetMin: 150, depthCm: 38, rainfallMmHr: 21.0 },
  { timeLabel: '+3 hr', offsetMin: 180, depthCm: 18, rainfallMmHr: 12.0 }
];

export const STATS_SPARKLINES = {
  riskTrend: [60, 72, 85, 94, 98, 95], // rising
  maxDepthTrend: [110, 122, 134, 140, 145], // rising
  rainfallTrend: [35, 42, 51, 64, 58.5], // heavy
  areasCountTrend: [5, 6, 8, 9, 9] // high
};

export const TRANSLATIONS: Record<'en' | 'hi' | 'mr', LanguageStrings> = {
  en: {
    alertTitle: 'Severe Flood Risk Across Mumbai',
    alertDesc: '8 areas severely inundated. Heavy monsoon cloudburst causing critical waterlogging in subways and arterial underpasses.',
    findSafeRoute: 'Find Safe Route',
    viewMap: 'View Flood Map',
    currentRisk: 'Current Risk',
    maxDepth: 'Max Water Depth',
    rainRate: 'Rainfall Rate',
    areasToAvoid: 'Areas to Avoid',
    whatIsHappening: 'What is happening right now?',
    whatShouldIDo: 'What should I do?',
    askAi: 'Ask FloodGuard AI',
    emergencyMode: 'Emergency Mode',
    shareAlert: 'Share Alert',
    emergencySos: 'Emergency SOS'
  },
  hi: {
    alertTitle: 'मुंबई में गंभीर बाढ़ की चेतावनी',
    alertDesc: '8 प्रमुख क्षेत्र जलमग्न। भारी मानसूनी बारिश के कारण सबवे और निचले इलाकों में खतरनाक जलभराव।',
    findSafeRoute: 'सुरक्षित मार्ग खोजें',
    viewMap: 'बाढ़ का नक्शा देखें',
    currentRisk: 'वर्तमान जोखिम',
    maxDepth: 'अधिकतम जल स्तर',
    rainRate: 'वर्षा दर',
    areasToAvoid: 'बचने योग्य क्षेत्र',
    whatIsHappening: 'अभी स्थिति क्या है?',
    whatShouldIDo: 'मुझे क्या करना चाहिए?',
    askAi: 'FloodGuard AI से पूछें',
    emergencyMode: 'आपातकालीन मोड',
    shareAlert: 'अलर्ट शेयर करें',
    emergencySos: 'आपातकालीन सहायता'
  },
  mr: {
    alertTitle: 'मुंबईत तीव्र पूरस्थितीचा इशारा',
    alertDesc: '8 भाग पाण्याखाली. मुसळधार पावसामुळे सखल भागात व सबवेमध्ये गंभीर पाणी साचले आहे.',
    findSafeRoute: 'सुरक्षित रस्ता शोधा',
    viewMap: 'पूर नकाशा पहा',
    currentRisk: 'सध्याचा धोका',
    maxDepth: 'कमाल पाण्याची खोली',
    rainRate: 'पावसाचा वेग',
    areasToAvoid: 'टाळायचे रस्ते',
    whatIsHappening: 'सध्या नक्की काय घडत आहे?',
    whatShouldIDo: 'नागरिकांनी काय करावे?',
    askAi: 'FloodGuard AI ला विचारा',
    emergencyMode: 'आणीबाणी मोड',
    shareAlert: 'अलर्ट शेअर करा',
    emergencySos: 'तातडीची मदत'
  }
};
