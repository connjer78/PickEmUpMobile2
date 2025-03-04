export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  isMetric: boolean
): number => {
  console.log('Calculating distance between:');
  console.log('Point 1:', lat1, lon1);
  console.log('Point 2:', lat2, lon2);

  // Earth's radius in meters
  const R = 6371000;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distanceInMeters = R * c;

  // Convert to feet if not metric
  const distance = isMetric ? distanceInMeters : distanceInMeters * 3.28084;

  console.log('Raw distance in meters:', distanceInMeters);
  console.log('Final distance:', distance, isMetric ? 'meters' : 'feet');
  
  // Round to nearest foot/meter
  return Math.round(distance);
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const calculateBearing = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);
  const dLon = toRad(lon2 - lon1);

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
          Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x);
  bearing = toDeg(bearing);
  
  // Normalize to 0-360
  bearing = (bearing + 360) % 360;

  console.log('Calculated bearing:', bearing, 'degrees');
  return bearing;
};

// Add this helper function
const toDeg = (rad: number): number => {
  return rad * (180 / Math.PI);
};

export const calculateWeightedMidpoint = (
  point1: Coordinates,
  point2: Coordinates,
  weight2: number // weight for point2 (0 to 1)
): Coordinates => {
  // Ensure weight is between 0 and 1
  const w2 = Math.max(0, Math.min(1, weight2));
  const w1 = 1 - w2;

  return {
    latitude: (point1.latitude * w1) + (point2.latitude * w2),
    longitude: (point1.longitude * w1) + (point2.longitude * w2)
  };
};

// Calculate a point at a given distance and bearing from a starting point
export const calculatePointFromBearing = (
  start: Coordinates,
  bearing: number,
  distance: number
): Coordinates => {
  // Convert distance from meters to degrees (approximate)
  const earthRadius = 6371000; // meters
  const angularDistance = distance / earthRadius;

  const lat1 = toRad(start.latitude);
  const lon1 = toRad(start.longitude);
  const bearingRad = toRad(bearing);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
    Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad)
  );

  const lon2 = lon1 + Math.atan2(
    Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
    Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
  );

  return {
    latitude: toDeg(lat2),
    longitude: toDeg(lon2)
  };
};

// Calculate points for the angled lines (+/- 20 degrees from center)
export const calculateRangeLines = (
  userLocation: Coordinates,
  target: Coordinates,
  bearing: number,
  distance: number
): {
  leftLine: [Coordinates, Coordinates];
  rightLine: [Coordinates, Coordinates];
} => {
  const leftBearing = (bearing - 20 + 360) % 360;
  const rightBearing = (bearing + 20 + 360) % 360;

  const leftEnd = calculatePointFromBearing(userLocation, leftBearing, distance);
  const rightEnd = calculatePointFromBearing(userLocation, rightBearing, distance);

  return {
    leftLine: [userLocation, leftEnd],
    rightLine: [userLocation, rightEnd]
  };
};

// Calculate points for an arc between two angles at a given distance
export const calculateArcPoints = (
  center: Coordinates,
  distance: number,
  startBearing: number,
  endBearing: number,
  numPoints: number = 20  // Number of points to generate along the arc
): Coordinates[] => {
  const points: Coordinates[] = [];
  
  // Ensure bearings are properly ordered
  let start = startBearing;
  let end = endBearing;
  if (end < start) end += 360;
  
  // Calculate points along the arc
  const step = (end - start) / (numPoints - 1);
  for (let i = 0; i < numPoints; i++) {
    const bearing = (start + step * i) % 360;
    points.push(calculatePointFromBearing(center, bearing, distance));
  }
  
  return points;
}; 