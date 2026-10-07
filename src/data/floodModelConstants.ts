/**
 * FloodGuard Hydrological Model Constants & Calibration
 * 
 * Historical Reference & Tuning:
 * Calibrated against Open-Meteo historical archive reanalysis (ERA5) and IMD records:
 * - Mumbai Deluge (26 July 2005): Peak 3-hour rainfall ~120-140 mm (daily 944 mm), causing 100-150 cm underpass submersion.
 * - Chennai Flood (01 Dec 2015): Peak 3-hour rainfall ~75 mm, causing severe basin inundation (Velachery/Madipakkam).
 * 
 * Reference Rainfall Benchmark:
 * 75.0 mm cumulative over 3 hours is established as the benchmark threshold (IMD Extremely Heavy Rain).
 * 
 * Formula:
 * depth_cm = base_depth_for_spot * (rain_last_3h_mm / reference_rain_mm) * low_lying_factor
 */

export const REFERENCE_RAIN_3H_MM = 75.0;

export interface SpotFloodConfig {
  spotId: string;
  spotName: string;
  baseDepthCm: number;    // Benchmark depth (cm) during reference deluge
  lowLyingFactor: number; // Topographic depression multiplier
}

export const DEFAULT_SPOT_CONFIG: SpotFloodConfig = {
  spotId: 'default',
  spotName: 'General Arterial Corridor',
  baseDepthCm: 35.0,
  lowLyingFactor: 0.90
};

export const SPOT_FLOOD_CONFIGS: Record<string, SpotFloodConfig> = {
  // --- MUMBAI ---
  mum_milan_subway: {
    spotId: 'mum_milan_subway',
    spotName: 'Milan Subway Underpass',
    baseDepthCm: 145.0,
    lowLyingFactor: 1.05
  },
  mum_hindmata: {
    spotId: 'mum_hindmata',
    spotName: 'Hindmata Junction & Dr. B.A. Road',
    baseDepthCm: 138.0,
    lowLyingFactor: 1.03
  },
  mum_andheri_subway: {
    spotId: 'mum_andheri_subway',
    spotName: 'Andheri Subway (S.V. Road Link)',
    baseDepthCm: 118.0,
    lowLyingFactor: 1.02
  },
  mum_gandhi_market: {
    spotId: 'mum_gandhi_market',
    spotName: 'Gandhi Market (King\'s Circle)',
    baseDepthCm: 90.0,
    lowLyingFactor: 1.00
  },
  mum_kings_circle: {
    spotId: 'mum_kings_circle',
    spotName: 'King’s Circle / Maheshwari Udyan',
    baseDepthCm: 84.0,
    lowLyingFactor: 0.98
  },
  mum_lbs_kurla: {
    spotId: 'mum_lbs_kurla',
    spotName: 'LBS Marg (Kurla West - Mithi River)',
    baseDepthCm: 72.0,
    lowLyingFactor: 0.96
  },
  mum_sion_circle: {
    spotId: 'mum_sion_circle',
    spotName: 'Sion Circle',
    baseDepthCm: 56.0,
    lowLyingFactor: 0.92
  },
  mum_chembur: {
    spotId: 'mum_chembur',
    spotName: 'Postal Colony (Chembur)',
    baseDepthCm: 42.0,
    lowLyingFactor: 0.90
  },
  mum_dadar_tt: {
    spotId: 'mum_dadar_tt',
    spotName: 'Dadar TT Circle',
    baseDepthCm: 28.0,
    lowLyingFactor: 0.85
  },
  mum_bkc_connector: {
    spotId: 'mum_bkc_connector',
    spotName: 'Bandra-Kurla Complex (BKC) Connector',
    baseDepthCm: 32.0,
    lowLyingFactor: 0.88
  },
  mum_kem_corridor: {
    spotId: 'mum_kem_corridor',
    spotName: 'Acharya Donde Marg (KEM Hospital Emergency)',
    baseDepthCm: 22.0,
    lowLyingFactor: 0.82
  },
  mum_senapati_bapat: {
    spotId: 'mum_senapati_bapat',
    spotName: 'Senapati Bapat Marg (Elphinstone / Lower Parel)',
    baseDepthCm: 40.0,
    lowLyingFactor: 0.90
  },
  mum_mahim_causeway: {
    spotId: 'mum_mahim_causeway',
    spotName: 'Mahim Causeway Coastal Link',
    baseDepthCm: 35.0,
    lowLyingFactor: 0.88
  },
  mum_sv_road_khar: {
    spotId: 'mum_sv_road_khar',
    spotName: 'Swami Vivekananda (S.V.) Road (Khar / Bandra)',
    baseDepthCm: 38.0,
    lowLyingFactor: 0.89
  },

  // --- DELHI NCR ---
  del_minto_bridge: {
    spotId: 'del_minto_bridge',
    spotName: 'Minto Bridge Underpass',
    baseDepthCm: 135.0,
    lowLyingFactor: 1.05
  },
  del_pul_prahladpur: {
    spotId: 'del_pul_prahladpur',
    spotName: 'Pul Prahladpur Railway Underpass',
    baseDepthCm: 105.0,
    lowLyingFactor: 1.02
  },
  del_ito_junction: {
    spotId: 'del_ito_junction',
    spotName: 'ITO Junction & Vikas Marg',
    baseDepthCm: 75.0,
    lowLyingFactor: 0.95
  },
  del_pragati_bhairon: {
    spotId: 'del_pragati_bhairon',
    spotName: 'Bhairon Marg / Ring Road Pragati Maidan',
    baseDepthCm: 65.0,
    lowLyingFactor: 0.92
  },
  del_kashmere_gate: {
    spotId: 'del_kashmere_gate',
    spotName: 'Kashmere Gate ISBT Ring Road',
    baseDepthCm: 70.0,
    lowLyingFactor: 0.95
  },
  del_ring_road_aiims: {
    spotId: 'del_ring_road_aiims',
    spotName: 'Ring Road AIIMS - Safdarjung Corridor',
    baseDepthCm: 25.0,
    lowLyingFactor: 0.85
  },
  del_barapullah_elevated: {
    spotId: 'del_barapullah_elevated',
    spotName: 'Barapullah Elevated Corridor',
    baseDepthCm: 8.0,
    lowLyingFactor: 0.40
  },
  del_connaught_outer: {
    spotId: 'del_connaught_outer',
    spotName: 'Connaught Place Outer Circle',
    baseDepthCm: 32.0,
    lowLyingFactor: 0.86
  },
  del_dhaula_kuan: {
    spotId: 'del_dhaula_kuan',
    spotName: 'Dhaula Kuan Arterial Grade Separator',
    baseDepthCm: 28.0,
    lowLyingFactor: 0.84
  },
  del_zakhira_flyover: {
    spotId: 'del_zakhira_flyover',
    spotName: 'Zakhira Underpass & Najafgarh Road',
    baseDepthCm: 88.0,
    lowLyingFactor: 0.98
  },

  // --- CHENNAI ---
  che_velachery_main: {
    spotId: 'che_velachery_main',
    spotName: 'Velachery Main Road & Lake Bypass',
    baseDepthCm: 115.0,
    lowLyingFactor: 1.02
  },
  che_vyasarpadi_subway: {
    spotId: 'che_vyasarpadi_subway',
    spotName: 'Vyasarpadi Ganesapuram Subway',
    baseDepthCm: 95.0,
    lowLyingFactor: 1.00
  },
  che_madipakkam_lake: {
    spotId: 'che_madipakkam_lake',
    spotName: 'Madipakkam Koot Road & Lake Basin',
    baseDepthCm: 82.0,
    lowLyingFactor: 0.98
  },
  che_usman_road: {
    spotId: 'che_usman_road',
    spotName: 'GN Chetty Road / Usman Road (T. Nagar)',
    baseDepthCm: 72.0,
    lowLyingFactor: 0.95
  },
  che_mudichur_road: {
    spotId: 'che_mudichur_road',
    spotName: 'Mudichur - Tambaram Main Link',
    baseDepthCm: 78.0,
    lowLyingFactor: 0.96
  },
  che_gst_kathipara: {
    spotId: 'che_gst_kathipara',
    spotName: 'Grand Southern Trunk (GST) Road - Kathipara Grade',
    baseDepthCm: 30.0,
    lowLyingFactor: 0.85
  },
  che_anna_salai_thousand: {
    spotId: 'che_anna_salai_thousand',
    spotName: 'Anna Salai (Thousand Lights / Gemini Circle)',
    baseDepthCm: 25.0,
    lowLyingFactor: 0.82
  },
  che_cooum_evr_periyar: {
    spotId: 'che_cooum_evr_periyar',
    spotName: 'Poonamallee High Road (EVR Periyar Salai)',
    baseDepthCm: 45.0,
    lowLyingFactor: 0.90
  },
  che_greams_road_apollo: {
    spotId: 'che_greams_road_apollo',
    spotName: 'Greams Road (Apollo Hospital Emergency Access)',
    baseDepthCm: 20.0,
    lowLyingFactor: 0.80
  },
  che_kamarajar_promenade: {
    spotId: 'che_kamarajar_promenade',
    spotName: 'Kamarajar Salai (Marina Beach Road)',
    baseDepthCm: 32.0,
    lowLyingFactor: 0.85
  }
};

/**
 * Estimate water depth (cm) for a given flood spot based on 3-hour rainfall accumulation.
 * Formula: depth_cm = base_depth_for_spot x (rain_last_3h_mm / reference_rain_mm) x low_lying_factor
 */
export function estimateWaterDepth(spotId: string, rainLast3hMm: number): number {
  if (rainLast3hMm <= 0.1) {
    return 0;
  }

  const config = SPOT_FLOOD_CONFIGS[spotId] || DEFAULT_SPOT_CONFIG;
  const rainRatio = Math.max(0, rainLast3hMm / REFERENCE_RAIN_3H_MM);
  const depth = config.baseDepthCm * rainRatio * config.lowLyingFactor;

  // Round to 1 decimal place
  return Math.max(0, Math.round(depth * 10) / 10);
}

/**
 * Map water depth to risk severity level
 */
export function depthToRiskLevel(depthCm: number): 'safe' | 'moderate' | 'high' | 'severe' {
  if (depthCm >= 30) return 'severe';
  if (depthCm >= 15) return 'high';
  if (depthCm >= 5) return 'moderate';
  return 'safe';
}
