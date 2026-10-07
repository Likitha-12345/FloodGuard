import { CityId } from '../types/flood';

export interface VerifiedLocation {
  id: string;
  name: string;
  neighborhood: string;
  cityId: CityId;
  coordinates: [number, number]; // [lat, lng] exact junction / subway center
  defaultDepthCm: number;
  osmType?: string;
  verifiedSource: string;
}

export interface VerifiedPOI {
  name: string;
  cityId: CityId;
  type: 'hospital' | 'fire_station';
  coordinates: [number, number]; // [lat, lng]
  label: string;
  info: string;
}

/**
 * Verified coordinates for flood locations verified via OpenStreetMap / Nominatim.
 */
export const VERIFIED_FLOOD_ZONES: Record<CityId, VerifiedLocation[]> = {
  mumbai: [
    {
      id: 'mum_milan_subway',
      name: 'Milan Subway Underpass',
      neighborhood: 'Santacruz West - Vile Parle',
      cityId: 'mumbai',
      coordinates: [19.0886, 72.8427],
      defaultDepthCm: 145,
      verifiedSource: 'Nominatim OpenStreetMap: Milan Subway, Santacruz'
    },
    {
      id: 'mum_hindmata',
      name: 'Hindmata Junction & Dr. B.A. Road',
      neighborhood: 'Dadar East / Parel',
      cityId: 'mumbai',
      coordinates: [19.0118, 72.8436],
      defaultDepthCm: 112,
      verifiedSource: 'Nominatim OpenStreetMap: Hindmata, Dadar East'
    },
    {
      id: 'mum_andheri_subway',
      name: 'Andheri Subway (S.V. Road Link)',
      neighborhood: 'Andheri West',
      cityId: 'mumbai',
      coordinates: [19.1197, 72.8464],
      defaultDepthCm: 98,
      verifiedSource: 'Nominatim OpenStreetMap: Andheri Subway'
    },
    {
      id: 'mum_gandhi_market',
      name: 'Gandhi Market & Kingsway',
      neighborhood: 'Matunga East',
      cityId: 'mumbai',
      coordinates: [19.0305, 72.8601],
      defaultDepthCm: 84,
      verifiedSource: 'Nominatim OpenStreetMap: Gandhi Market, Matunga'
    },
    {
      id: 'mum_kings_circle',
      name: 'King’s Circle / Maheshwari Udyan',
      neighborhood: 'Matunga Central',
      cityId: 'mumbai',
      coordinates: [19.0274, 72.8558],
      defaultDepthCm: 76,
      verifiedSource: 'Nominatim OpenStreetMap: Kings Circle, Mumbai'
    },
    {
      id: 'mum_lbs_kurla',
      name: 'L.B.S. Marg (Kamani - Kurla Depot)',
      neighborhood: 'Kurla West',
      cityId: 'mumbai',
      coordinates: [19.0718, 72.8833],
      defaultDepthCm: 68,
      verifiedSource: 'Nominatim OpenStreetMap: LBS Marg, Kurla West'
    },
    {
      id: 'mum_sion_circle',
      name: 'Sion Circle & Sion-Panvel Highway',
      neighborhood: 'Sion',
      cityId: 'mumbai',
      coordinates: [19.0392, 72.8619],
      defaultDepthCm: 52,
      verifiedSource: 'Nominatim OpenStreetMap: Sion Circle, Sion'
    },
    {
      id: 'mum_chembur',
      name: 'Chembur Postal Colony & VN Purav Marg',
      neighborhood: 'Chembur East',
      cityId: 'mumbai',
      coordinates: [19.0558, 72.9022],
      defaultDepthCm: 38,
      verifiedSource: 'Nominatim OpenStreetMap: VN Purav Marg, Chembur'
    },
    {
      id: 'mum_dadar_tt',
      name: 'Dadar T.T. Circle & Tilak Bridge',
      neighborhood: 'Dadar Central',
      cityId: 'mumbai',
      coordinates: [19.0178, 72.8478],
      defaultDepthCm: 18,
      verifiedSource: 'Nominatim OpenStreetMap: Dadar TT Circle'
    }
  ],
  delhi: [
    {
      id: 'del_minto_bridge',
      name: 'Minto Bridge Underpass',
      neighborhood: 'Connaught Place South',
      cityId: 'delhi',
      coordinates: [28.6366, 77.2274],
      defaultDepthCm: 128,
      verifiedSource: 'Nominatim OpenStreetMap: Minto Bridge, New Delhi'
    },
    {
      id: 'del_ito_junction',
      name: 'ITO Junction & Vikas Marg',
      neighborhood: 'Indraprastha / ITO',
      cityId: 'delhi',
      coordinates: [28.6295, 77.2435],
      defaultDepthCm: 88,
      verifiedSource: 'Nominatim OpenStreetMap: ITO, Delhi'
    },
    {
      id: 'del_pragati_maidan',
      name: 'Pragati Maidan / Bhairon Marg',
      neighborhood: 'Central Vista / Mathura Road',
      cityId: 'delhi',
      coordinates: [28.6160, 77.2430],
      defaultDepthCm: 74,
      verifiedSource: 'Nominatim OpenStreetMap: Bhairon Marg, Delhi'
    },
    {
      id: 'del_kashmere_gate',
      name: 'Kashmere Gate ISBT & Ring Road',
      neighborhood: 'North Delhi / Yamuna Bank',
      cityId: 'delhi',
      coordinates: [28.6675, 77.2289],
      defaultDepthCm: 62,
      verifiedSource: 'Nominatim OpenStreetMap: Kashmere Gate, Delhi'
    },
    {
      id: 'del_pul_prahladpur',
      name: 'Pul Prahladpur Railway Underpass',
      neighborhood: 'Mehrauli-Badarpur Road',
      cityId: 'delhi',
      coordinates: [28.5020, 77.2890],
      defaultDepthCm: 95,
      verifiedSource: 'Nominatim OpenStreetMap: Pul Prahladpur'
    }
  ],
  chennai: [
    {
      id: 'che_velachery_main',
      name: 'Velachery Main Road & Lake Basin',
      neighborhood: 'Velachery South',
      cityId: 'chennai',
      coordinates: [12.9805, 80.2205],
      defaultDepthCm: 120,
      verifiedSource: 'Nominatim OpenStreetMap: Velachery Main Road, Chennai'
    },
    {
      id: 'che_usman_road',
      name: 'Usman Road & Panagal Park',
      neighborhood: 'T. Nagar',
      cityId: 'chennai',
      coordinates: [13.0416, 80.2335],
      defaultDepthCm: 82,
      verifiedSource: 'Nominatim OpenStreetMap: Usman Road, T Nagar'
    },
    {
      id: 'che_madipakkam_lake',
      name: 'Madipakkam Lake Road',
      neighborhood: 'Madipakkam',
      cityId: 'chennai',
      coordinates: [12.9650, 80.1980],
      defaultDepthCm: 75,
      verifiedSource: 'Nominatim OpenStreetMap: Madipakkam, Chennai'
    },
    {
      id: 'che_mudichur_road',
      name: 'Mudichur Road & Adyar Tributary',
      neighborhood: 'Tambaram West / Mudichur',
      cityId: 'chennai',
      coordinates: [12.9150, 80.0750],
      defaultDepthCm: 92,
      verifiedSource: 'Nominatim OpenStreetMap: Mudichur Road, Tambaram'
    },
    {
      id: 'che_vyasarpadi_subway',
      name: 'Vyasarpadi Ganesapuram Subway',
      neighborhood: 'Vyasarpadi / Perambur',
      cityId: 'chennai',
      coordinates: [13.1140, 80.2605],
      defaultDepthCm: 110,
      verifiedSource: 'Nominatim OpenStreetMap: Vyasarpadi, Chennai'
    },
    {
      id: 'che_kathipara_junction',
      name: 'Kathipara Cloverleaf Junction',
      neighborhood: 'Guindy / Alandur',
      cityId: 'chennai',
      coordinates: [13.0076, 80.2031],
      defaultDepthCm: 32,
      verifiedSource: 'Nominatim OpenStreetMap: Kathipara Junction, Guindy'
    }
  ]
};

/**
 * Verified Hospitals and Fire Stations with OpenStreetMap verified coordinates.
 */
export const VERIFIED_POIS: Record<CityId, VerifiedPOI[]> = {
  mumbai: [
    {
      name: 'KEM Hospital (Parel)',
      cityId: 'mumbai',
      type: 'hospital',
      coordinates: [19.0028, 72.8427],
      label: 'Level 1 Trauma & Tertiary Hospital',
      info: '24/7 Apex municipal emergency trauma care.'
    },
    {
      name: 'Sion Hospital (LTMMC)',
      cityId: 'mumbai',
      type: 'hospital',
      coordinates: [19.0375, 72.8612],
      label: 'Major Municipal Trauma Hub',
      info: '24/7 Critical emergency and flood response hub.'
    },
    {
      name: 'Hinduja Hospital (Mahim)',
      cityId: 'mumbai',
      type: 'hospital',
      coordinates: [19.0335, 72.8391],
      label: 'Cardiac & Acute Care',
      info: 'Super-specialty trauma unit with flood bypass access.'
    },
    {
      name: 'Lilavati Hospital (Bandra West)',
      cityId: 'mumbai',
      type: 'hospital',
      coordinates: [19.0514, 72.8291],
      label: 'Super-Specialty Trauma',
      info: 'Trauma care center near Western Express Highway.'
    },
    {
      name: 'Nanavati Hospital (Vile Parle)',
      cityId: 'mumbai',
      type: 'hospital',
      coordinates: [19.0967, 72.8415],
      label: 'Critical Care Facility',
      info: 'Suburban tertiary care emergency unit.'
    },
    {
      name: 'Dadar Fire Brigade Station',
      cityId: 'mumbai',
      type: 'fire_station',
      coordinates: [19.0195, 72.8432],
      label: 'MCGM-FS-04',
      info: 'Central Mumbai rapid disaster response post.'
    },
    {
      name: 'Byculla Fire Command HQ',
      cityId: 'mumbai',
      type: 'fire_station',
      coordinates: [18.9750, 72.8330],
      label: 'MCGM-FS-01',
      info: 'Municipal Fire Command & Heavy Pumping Unit.'
    },
    {
      name: 'Bandra Kurla Disaster Response Post',
      cityId: 'mumbai',
      type: 'fire_station',
      coordinates: [19.0645, 72.8620],
      label: 'SDRF-MUM-02',
      info: 'SDRF amphibious boat rescue standby.'
    }
  ],
  delhi: [
    {
      name: 'AIIMS New Delhi (Ansari Nagar)',
      cityId: 'delhi',
      type: 'hospital',
      coordinates: [28.5672, 77.2100],
      label: 'Apex Trauma Center',
      info: 'National apex emergency medical trauma center.'
    },
    {
      name: 'Safdarjung Hospital',
      cityId: 'delhi',
      type: 'hospital',
      coordinates: [28.5694, 77.2076],
      label: 'Emergency & Burns Center',
      info: '24/7 Multi-specialty trauma emergency hub.'
    },
    {
      name: 'LNJP Hospital (Delhi Gate)',
      cityId: 'delhi',
      type: 'hospital',
      coordinates: [28.6368, 77.2415],
      label: 'Central Delhi Trauma',
      info: 'Immediate emergency responder for Walled City & Ring Road.'
    },
    {
      name: 'Connaught Place Fire Station',
      cityId: 'delhi',
      type: 'fire_station',
      coordinates: [28.6295, 77.2185],
      label: 'DFS-CP-01',
      info: 'Central Delhi Fire Station on active standby.'
    },
    {
      name: 'Pragati Maidan Fire Post',
      cityId: 'delhi',
      type: 'fire_station',
      coordinates: [28.6160, 77.2410],
      label: 'DFS-PM-03',
      info: 'High-volume dewatering unit stationed near Yamuna basin.'
    }
  ],
  chennai: [
    {
      name: 'Rajiv Gandhi Govt General Hospital (Central)',
      cityId: 'chennai',
      type: 'hospital',
      coordinates: [13.0805, 80.2785],
      label: 'Government Apex Trauma',
      info: 'Major metropolitan trauma and critical care hub.'
    },
    {
      name: 'Apollo Hospitals (Greams Road)',
      cityId: 'chennai',
      type: 'hospital',
      coordinates: [13.0583, 80.2526],
      label: 'Tertiary Emergency Care',
      info: 'Super-specialty acute cardiac and emergency care.'
    },
    {
      name: 'MIOT International (Manapakkam)',
      cityId: 'chennai',
      type: 'hospital',
      coordinates: [13.0182, 80.1788],
      label: 'Multi-Specialty Trauma',
      info: 'Adyar basin emergency trauma center.'
    },
    {
      name: 'Egmore Fire Station & Rescue HQ',
      cityId: 'chennai',
      type: 'fire_station',
      coordinates: [13.0780, 80.2600],
      label: 'TNFRS-EGM-01',
      info: 'Tamil Nadu Fire & Rescue Services Command HQ.'
    },
    {
      name: 'T. Nagar Fire Post',
      cityId: 'chennai',
      type: 'fire_station',
      coordinates: [13.0390, 80.2310],
      label: 'TNFRS-TN-02',
      info: 'Inundation dewatering and citizen evacuation unit.'
    }
  ]
};

/**
 * Calculates circle flood zone styling based on water depth:
 * - 30-60 cm: 80m radius, yellow (#eab308)
 * - 60-100 cm: 150m radius, orange (#f97316)
 * - >100 cm: 250m radius, red (#ef4444)
 * - <30 cm: 50m radius, yellow-green (#84cc16)
 */
export function getFloodZoneCircleConfig(depthCm: number): {
  radiusM: number;
  color: string;
  fillColor: string;
  fillOpacity: number;
  weight: number;
  isRedPulsing: boolean;
  severityLabel: string;
} {
  if (depthCm > 100) {
    return {
      radiusM: 250,
      color: '#dc2626',
      fillColor: '#ef4444',
      fillOpacity: 0.4,
      weight: 2.5,
      isRedPulsing: true,
      severityLabel: 'Severe Flood (>100 cm)'
    };
  } else if (depthCm >= 60) {
    return {
      radiusM: 150,
      color: '#ea580c',
      fillColor: '#f97316',
      fillOpacity: 0.4,
      weight: 2,
      isRedPulsing: false,
      severityLabel: 'High Inundation (60–100 cm)'
    };
  } else if (depthCm >= 30) {
    return {
      radiusM: 80,
      color: '#ca8a04',
      fillColor: '#eab308',
      fillOpacity: 0.4,
      weight: 2,
      isRedPulsing: false,
      severityLabel: 'Moderate Water (30–60 cm)'
    };
  } else {
    return {
      radiusM: 50,
      color: '#65a30d',
      fillColor: '#84cc16',
      fillOpacity: 0.35,
      weight: 1.5,
      isRedPulsing: false,
      severityLabel: 'Caution Surface Water (<30 cm)'
    };
  }
}
