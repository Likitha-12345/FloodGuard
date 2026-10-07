import { CityId, StreetFeature, RainfallScenario } from '../types/flood';
import { CITIES_INFO } from './citiesData';

export type TripVehicle = 'walk' | 'two_wheeler' | 'car' | 'bus';
export type TripVerdict = 'GO' | 'CAUTION' | 'DONT_GO';

export interface VehicleThresholds {
  goMaxDepthCm: number;
  cautionMaxDepthCm: number;
  label: string;
}

/**
 * Verdict rules (tuneable constants):
 * - Max estimated depth on the trip path at the chosen time.
 * - Walk: GO under 10 cm, CAUTION 10-20 cm, DON'T GO above 20 cm.
 * - Two-wheeler: GO under 10 cm, CAUTION 10-15 cm, DON'T GO above 15 cm.
 * - Car: GO under 15 cm, CAUTION 15-30 cm, DON'T GO above 30 cm.
 * - Bus: GO under 30 cm, CAUTION 30-50 cm, DON'T GO above 50 cm.
 */
export const TRIP_VEHICLE_THRESHOLDS: Record<TripVehicle, VehicleThresholds> = {
  walk: {
    goMaxDepthCm: 10,
    cautionMaxDepthCm: 20,
    label: 'Walk'
  },
  two_wheeler: {
    goMaxDepthCm: 10,
    cautionMaxDepthCm: 15,
    label: 'Two-wheeler'
  },
  car: {
    goMaxDepthCm: 15,
    cautionMaxDepthCm: 30,
    label: 'Car'
  },
  bus: {
    goMaxDepthCm: 30,
    cautionMaxDepthCm: 50,
    label: 'Bus'
  }
};

export interface CityPlaceOption {
  id: string;
  name: string;
  group: 'Saved Places' | 'Main Landmarks' | 'Hospitals';
  coordinates: [number, number];
}

export function getTripPlacesForCity(cityId: CityId): CityPlaceOption[] {
  const city = CITIES_INFO[cityId] || CITIES_INFO.mumbai;
  const places: CityPlaceOption[] = [];

  // Saved places per city
  if (cityId === 'mumbai') {
    places.push({
      id: 'saved-home-mum',
      name: 'Home (Dadar East, Dr. B.A. Road)',
      group: 'Saved Places',
      coordinates: [19.0178, 72.8478]
    });
    places.push({
      id: 'saved-work-mum',
      name: 'Work (Bandra-Kurla Complex)',
      group: 'Saved Places',
      coordinates: [19.0667, 72.8687]
    });
    places.push({
      id: 'saved-station-mum',
      name: 'Dadar Central Station',
      group: 'Saved Places',
      coordinates: [19.0185, 72.8435]
    });
  } else if (cityId === 'delhi') {
    places.push({
      id: 'saved-home-del',
      name: 'Home (Connaught Place)',
      group: 'Saved Places',
      coordinates: [28.6315, 77.2167]
    });
    places.push({
      id: 'saved-work-del',
      name: 'Work (Pragati Maidan)',
      group: 'Saved Places',
      coordinates: [28.6186, 77.2435]
    });
    places.push({
      id: 'saved-station-del',
      name: 'New Delhi Railway Station',
      group: 'Saved Places',
      coordinates: [28.6430, 77.2195]
    });
  } else {
    places.push({
      id: 'saved-home-che',
      name: 'Home (T. Nagar, Usman Road)',
      group: 'Saved Places',
      coordinates: [13.0416, 80.2335]
    });
    places.push({
      id: 'saved-work-che',
      name: 'Work (Kathipara Interchange)',
      group: 'Saved Places',
      coordinates: [13.0076, 80.2031]
    });
    places.push({
      id: 'saved-station-che',
      name: 'Chennai Central Station',
      group: 'Saved Places',
      coordinates: [13.0827, 80.2755]
    });
  }

  // Landmarks
  city.landmarks.forEach((lm, idx) => {
    places.push({
      id: `lm-${idx}`,
      name: lm.name,
      group: 'Main Landmarks',
      coordinates: lm.coordinates
    });
  });

  // Hospitals
  city.hospitals.forEach((hosp, idx) => {
    places.push({
      id: `hosp-${idx}`,
      name: hosp.name,
      group: 'Hospitals',
      coordinates: hosp.coordinates
    });
  });

  return places;
}

export function evaluateTripVerdict(depthCm: number, vehicle: TripVehicle): TripVerdict {
  const rules = TRIP_VEHICLE_THRESHOLDS[vehicle];
  if (depthCm < rules.goMaxDepthCm) {
    return 'GO';
  }
  if (depthCm <= rules.cautionMaxDepthCm) {
    return 'CAUTION';
  }
  return 'DONT_GO';
}

export function canVehiclePass(depthCm: number, vehicle: TripVehicle): 'Yes' | 'Caution' | 'Cannot pass' {
  const verdict = evaluateTripVerdict(depthCm, vehicle);
  if (verdict === 'GO') return 'Yes';
  if (verdict === 'CAUTION') return 'Caution';
  return 'Cannot pass';
}

export interface RiskySpot {
  id: string;
  name: string;
  estimatedDepthCm: number;
  canPass: 'Yes' | 'Caution' | 'Cannot pass';
}

export interface TimelineSlot {
  timeOffsetMin: number;
  timeLabel: string;
  verdict: TripVerdict;
  maxDepthCm: number;
  isBestWindow: boolean;
}

export interface TripAssessment {
  verdict: TripVerdict;
  reason: string;
  maxEstimatedDepthCm: number;
  riskySpots: RiskySpot[];
  timeline: TimelineSlot[];
  bestWindowLabel: string;
  fromName: string;
  toName: string;
  vehicle: TripVehicle;
  whenOffsetMin: number;
  whenLabel: string;
}

/**
 * Format time string e.g. "6 PM" or "5:30 PM" based on current local time + offset minutes
 */
export function formatTargetTime(offsetMin: number): string {
  const targetDate = new Date(Date.now() + offsetMin * 60 * 1000);
  const hours = targetDate.getHours();
  const minutes = targetDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  if (minutes === 0) {
    return `${displayHours} ${ampm}`;
  }
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Deterministic calculation of Trip Check assessment based on live Open-Meteo forecast or demo scenario
 */
export function calculateTripAssessment(params: {
  cityId: CityId;
  fromPlace: CityPlaceOption;
  toPlace: CityPlaceOption;
  vehicle: TripVehicle;
  whenOffsetMin: number;
  streets: StreetFeature[];
  activeScenario?: RainfallScenario;
}): TripAssessment {
  const { fromPlace, toPlace, vehicle, whenOffsetMin, streets, activeScenario } = params;

  // Determine if there is completely zero rainfall
  const isNoRain = !activeScenario || (activeScenario.intensityMmHr === 0 && activeScenario.cum3hMm === 0);

  // Identify candidate corridor streets based on proximity to From/To
  const [oLat, oLng] = fromPlace.coordinates;
  const [dLat, dLng] = toPlace.coordinates;
  const midLat = (oLat + dLat) / 2;
  const midLng = (oLng + dLng) / 2;

  // Score streets by distance to origin, destination, and midpoint
  const scoredStreets = [...streets].map((st) => {
    const sCoord = st.coordinates[0] || [midLat, midLng];
    const distToOrigin = Math.hypot(sCoord[0] - oLat, sCoord[1] - oLng);
    const distToDest = Math.hypot(sCoord[0] - dLat, sCoord[1] - dLng);
    const distToMid = Math.hypot(sCoord[0] - midLat, sCoord[1] - midLng);
    const totalDist = distToOrigin * 0.4 + distToDest * 0.4 + distToMid * 0.2;
    return { street: st, distance: totalDist };
  });

  scoredStreets.sort((a, b) => a.distance - b.distance);
  // Corridor streets for this route
  const corridorStreets = scoredStreets.slice(0, 5).map((s) => s.street);

  // Helper to get max depth on corridor at specific offset
  const getCorridorDepthAtOffset = (offset: number): { maxDepth: number; spots: { street: StreetFeature; depth: number }[] } => {
    if (isNoRain) {
      return { maxDepth: 0, spots: corridorStreets.map((st) => ({ street: st, depth: 0 })) };
    }

    const spotsWithDepth = corridorStreets.map((st) => {
      const step = st.forecast.find((f) => f.timeOffsetMin === offset) ||
        st.forecast.find((f) => Math.abs(f.timeOffsetMin - offset) <= 15) ||
        st.forecast[0];
      const depth = step?.predictedDepthCm || 0;
      return { street: st, depth };
    });

    const maxDepth = Math.max(0, ...spotsWithDepth.map((s) => s.depth));
    return { maxDepth, spots: spotsWithDepth };
  };

  // Evaluate at chosen time
  const { maxDepth: chosenMaxDepth, spots: chosenSpots } = getCorridorDepthAtOffset(whenOffsetMin);

  // Sort risky spots by depth descending
  const sortedSpots = [...chosenSpots].sort((a, b) => b.depth - a.depth);
  const topRisky = sortedSpots.slice(0, 3).map((item) => ({
    id: item.street.id,
    name: item.street.name,
    estimatedDepthCm: item.depth,
    canPass: canVehiclePass(item.depth, vehicle)
  }));

  // Verdict at chosen time
  const verdict: TripVerdict = isNoRain || chosenMaxDepth === 0 ? 'GO' : evaluateTripVerdict(chosenMaxDepth, vehicle);

  // One line reason
  const targetTimeStr = formatTargetTime(whenOffsetMin);
  let reason = '';
  if (isNoRain || chosenMaxDepth === 0) {
    reason = 'No flooding expected.';
  } else {
    const worstSpot = topRisky[0] || { name: 'Main corridor', estimatedDepthCm: chosenMaxDepth };
    reason = `${worstSpot.name} may have ${worstSpot.estimatedDepthCm} cm water at ${targetTimeStr}.`;
  }

  // 3-hour timeline per 30 minutes: 0, 30, 60, 90, 120, 150, 180
  const timeOffsets = [0, 30, 60, 90, 120, 150, 180];
  const timelineData = timeOffsets.map((t) => {
    const { maxDepth } = getCorridorDepthAtOffset(t);
    const slotVerdict = isNoRain || maxDepth === 0 ? 'GO' : evaluateTripVerdict(maxDepth, vehicle);
    const timeLabel = t === 0 ? 'Now' : `+${t}m`;
    return {
      timeOffsetMin: t,
      timeLabel,
      verdict: slotVerdict,
      maxDepthCm: maxDepth,
      isBestWindow: false
    };
  });

  // Find best window: minimum maxDepthCm, preferring earlier time if tied
  let minDepth = Infinity;
  let bestIndex = 0;
  timelineData.forEach((slot, index) => {
    if (slot.maxDepthCm < minDepth) {
      minDepth = slot.maxDepthCm;
      bestIndex = index;
    }
  });

  timelineData[bestIndex].isBestWindow = true;
  const bestSlot = timelineData[bestIndex];
  const bestWindowLabel = bestSlot.timeOffsetMin === 0 ? 'Now' : `In ${bestSlot.timeOffsetMin} min (${formatTargetTime(bestSlot.timeOffsetMin)})`;

  const whenLabel =
    whenOffsetMin === 0
      ? 'Now'
      : whenOffsetMin === 60
      ? 'In 1 hour'
      : whenOffsetMin === 120
      ? 'In 2 hours'
      : 'In 3 hours';

  return {
    verdict,
    reason,
    maxEstimatedDepthCm: chosenMaxDepth,
    riskySpots: topRisky,
    timeline: timelineData,
    bestWindowLabel,
    fromName: fromPlace.name,
    toName: toPlace.name,
    vehicle,
    whenOffsetMin,
    whenLabel
  };
}
