import { CityId, RainfallScenario } from '../types/flood';
import { CITIES_INFO } from '../data/citiesData';

export interface LiveRainfallResult {
  success: boolean;
  scenario: RainfallScenario;
  isCached: boolean;
  error?: string;
}

// In-memory cache per city with timestamp (10 min TTL = 600,000 ms)
interface CachedCityData {
  scenario: RainfallScenario;
  timestamp: number;
}

const cache: Partial<Record<CityId, CachedCityData>> = {};
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Fetch real live precipitation forecast from Open-Meteo
 * Forecast endpoint: minutely_15=precipitation & hourly=precipitation,precipitation_probability
 */
export async function fetchLiveRainfallFromOpenMeteo(cityId: CityId): Promise<LiveRainfallResult> {
  const now = Date.now();
  const cached = cache[cityId];

  // Return cached data if fresh (less than 10 minutes old)
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return {
      success: true,
      scenario: cached.scenario,
      isCached: true
    };
  }

  const cityInfo = CITIES_INFO[cityId] || CITIES_INFO.mumbai;
  const [lat, lon] = cityInfo.center;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&minutely_15=precipitation&hourly=precipitation,precipitation_probability&forecast_days=1&timezone=Asia%2FKolkata`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP ${res.status}`);
    }

    const data = await res.json();
    const scenario = parseOpenMeteoResponse(cityId, cityInfo.name, data);

    // Save to cache
    cache[cityId] = {
      scenario,
      timestamp: now
    };

    return {
      success: true,
      scenario,
      isCached: false
    };
  } catch (err) {
    console.warn(`[Open-Meteo] Live fetch failed for ${cityId}:`, err);

    // Fall back to last saved cached data if available
    if (cached) {
      return {
        success: false,
        scenario: cached.scenario,
        isCached: true,
        error: 'Live data unavailable (using cached data)'
      };
    }

    // Baseline fallback if no cache exists
    const fallbackScenario: RainfallScenario = {
      id: 'live',
      name: 'Live (Open-Meteo)',
      description: 'Live data unavailable. Displaying clear baseline telemetry.',
      source: 'api',
      intensityMmHr: 0.0,
      cum1hMm: 0.0,
      cum3hMm: 0.0,
      cum6hMm: 0.0,
      radarDbz: 0.0,
      stationName: `Open-Meteo API (${cityInfo.name})`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      forecastCurve: Array.from({ length: 13 }, (_, i) => ({
        timeOffsetMin: i * 15,
        intensityMmHr: 0
      }))
    };

    return {
      success: false,
      scenario: fallbackScenario,
      isCached: false,
      error: 'Live data unavailable'
    };
  }
}

/**
 * Parse Open-Meteo JSON into a typed RainfallScenario
 */
export function parseOpenMeteoResponse(
  cityId: CityId,
  cityName: string,
  data: any
): RainfallScenario {
  const minutelyTimes: string[] = data?.minutely_15?.time || [];
  const minutelyPrecips: number[] = data?.minutely_15?.precipitation || [];

  // Determine current slot in Asia/Kolkata timezone
  const now = new Date();
  const istDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
  const istTimeStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }); // HH:mm
  const istMinutes = parseInt(istTimeStr.slice(3, 5), 10);
  const roundedMinute = Math.floor(istMinutes / 15) * 15;
  const minuteFormatted = roundedMinute < 10 ? `0${roundedMinute}` : `${roundedMinute}`;
  const targetIso = `${istDateStr}T${istTimeStr.slice(0, 2)}:${minuteFormatted}`;

  let currentIdx = minutelyTimes.findIndex(t => t.startsWith(targetIso.slice(0, 15)));
  if (currentIdx === -1) {
    // Fall back to hour match
    currentIdx = minutelyTimes.findIndex(t => t.startsWith(`${istDateStr}T${istTimeStr.slice(0, 2)}:`));
  }
  if (currentIdx === -1) {
    currentIdx = 0;
  }

  // Current precipitation in mm for 15-min slot; converted to mm/hr
  const currentSlot15m = minutelyPrecips[currentIdx] || 0;
  const currentRateMmHr = Math.round(currentSlot15m * 4 * 10) / 10;

  // Next 3 hours = 12 slots of 15 min (from currentIdx to currentIdx + 11)
  let next1hSum = 0;
  let next3hSum = 0;
  let next6hSum = 0;
  const forecastCurve: { timeOffsetMin: number; intensityMmHr: number }[] = [];

  for (let offset = 0; offset <= 180; offset += 15) {
    const slotIdx = currentIdx + (offset / 15);
    const slotMm = (slotIdx < minutelyPrecips.length) ? (minutelyPrecips[slotIdx] || 0) : 0;
    const rate = Math.round(slotMm * 4 * 10) / 10;

    forecastCurve.push({
      timeOffsetMin: offset,
      intensityMmHr: rate
    });

    if (offset <= 60) next1hSum += slotMm;
    if (offset <= 180) next3hSum += slotMm;
  }

  // Next 6 hours sum
  for (let offset = 0; offset <= 360; offset += 15) {
    const slotIdx = currentIdx + (offset / 15);
    const slotMm = (slotIdx < minutelyPrecips.length) ? (minutelyPrecips[slotIdx] || 0) : 0;
    next6hSum += slotMm;
  }

  // Past 3 hours sum (slots currentIdx - 11 to currentIdx)
  let past3hSum = 0;
  const pastStartIdx = Math.max(0, currentIdx - 11);
  for (let i = pastStartIdx; i <= currentIdx; i++) {
    past3hSum += (minutelyPrecips[i] || 0);
  }

  // 3-hour rainfall accumulation considered for flood estimation
  // Max of past 3h accumulation and upcoming 3h forecast accumulation
  const effective3hRainMm = Math.max(
    Math.round(past3hSum * 10) / 10,
    Math.round(next3hSum * 10) / 10,
    currentRateMmHr > 0 ? Math.round(currentRateMmHr * 1.5 * 10) / 10 : 0
  );

  const formattedIstTimestamp = now.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit'
  }) + ' IST';

  const conditionDescription = currentRateMmHr > 40
    ? `Severe monsoon downpour (${currentRateMmHr} mm/hr) recorded by Open-Meteo.`
    : currentRateMmHr > 15
    ? `Moderate convective rainfall (${currentRateMmHr} mm/hr) observed in ${cityName}.`
    : currentRateMmHr > 0.5
    ? `Light rain / showers (${currentRateMmHr} mm/hr) detected via Open-Meteo.`
    : `Clear / dry conditions reported across ${cityName} by Open-Meteo.`;

  return {
    id: 'live',
    name: 'Live (Open-Meteo)',
    description: conditionDescription,
    source: 'api',
    intensityMmHr: currentRateMmHr,
    cum1hMm: Math.round(next1hSum * 10) / 10,
    cum3hMm: effective3hRainMm,
    cum6hMm: Math.round(next6hSum * 10) / 10,
    radarDbz: currentRateMmHr > 0 ? Math.round(Math.min(65, 10 + currentRateMmHr * 0.7) * 10) / 10 : 0,
    stationName: `Open-Meteo Forecast (${cityName})`,
    timestamp: formattedIstTimestamp,
    forecastCurve
  };
}
