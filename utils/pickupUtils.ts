import { Coordinates, Throw } from '../context/AppStateContext';
import { calculateDistance } from './distanceUtils';

export interface RoutePoint extends Coordinates {
  id: string;
  isThrow: boolean;
}

export interface PickupRoute {
  points: RoutePoint[];
  remainingThrows: Throw[];
  collectedThrows: Throw[];
}

// Helper function to find the nearest throw to a given point
const findNearestThrow = (
  point: Coordinates,
  throws: Throw[],
  collectedThrows: Throw[] = []
): Throw | null => {
  if (throws.length === 0) return null;

  const availableThrows = throws.filter(t => 
    !collectedThrows.some(ct => ct.id === t.id)
  );

  if (availableThrows.length === 0) return null;

  // Calculate distances once and store them
  const throwDistances = availableThrows.map(t => ({
    throw: t,
    distance: calculateDistance(
      point.latitude,
      point.longitude,
      t.latitude,
      t.longitude,
      false
    )
  }));

  // Find the minimum distance throw
  return throwDistances.reduce((min, curr) => 
    curr.distance < min.distance ? curr : min
  ).throw;
};

// Check if a path between two points would cross any existing path segments
const wouldCrossPath = (
  start: Coordinates,
  end: Coordinates,
  existingPoints: RoutePoint[]
): boolean => {
  // Skip check if we don't have enough points for a path
  if (existingPoints.length < 2) return false;

  for (let i = 0; i < existingPoints.length - 1; i++) {
    const pathStart = existingPoints[i];
    const pathEnd = existingPoints[i + 1];

    if (doLineSegmentsIntersect(
      start.latitude, start.longitude,
      end.latitude, end.longitude,
      pathStart.latitude, pathStart.longitude,
      pathEnd.latitude, pathEnd.longitude
    )) {
      return true;
    }
  }

  return false;
};

// Helper function to check if two line segments intersect
const doLineSegmentsIntersect = (
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number,
  x4: number, y4: number
): boolean => {
  const denominator = ((x2 - x1) * (y4 - y3)) - ((y2 - y1) * (x4 - x3));
  if (denominator === 0) return false;

  const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denominator;
  const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denominator;

  return (ua >= 0 && ua <= 1) && (ub >= 0 && ub <= 1);
};

// Main function to calculate the pickup route
export const calculatePickupRoute = (
  currentLocation: Coordinates,
  throws: Throw[],
  collectedThrows: Throw[] = []
): PickupRoute => {
  // Early return if no throws
  if (throws.length === 0) {
    return {
      points: [{
        ...currentLocation,
        id: 'current',
        isThrow: false
      }],
      remainingThrows: [],
      collectedThrows
    };
  }

  const route: RoutePoint[] = [{
    ...currentLocation,
    id: 'current',
    isThrow: false
  }];

  const remainingThrows = [...throws];
  let currentPoint = currentLocation;

  // Pre-calculate distances for initial point
  let throwDistances = remainingThrows.map(t => ({
    throw: t,
    distance: calculateDistance(
      currentPoint.latitude,
      currentPoint.longitude,
      t.latitude,
      t.longitude,
      false
    )
  }));

  while (remainingThrows.length > 0) {
    // Find nearest throw that won't create crossing paths
    let bestThrow: Throw | null = null;
    let minDistance = Infinity;

    // Sort throws by distance to optimize path finding
    throwDistances.sort((a, b) => a.distance - b.distance);

    // Check throws in order of distance
    for (const {throw: t, distance} of throwDistances) {
      if (collectedThrows.some(ct => ct.id === t.id)) continue;

      // Check if this path would cross any existing paths
      if (!wouldCrossPath(currentPoint, t, route) && distance < minDistance) {
        minDistance = distance;
        bestThrow = t;
        break; // Take the first valid throw we find
      }
    }

    // If we couldn't find a throw without crossing paths, just take the nearest
    if (!bestThrow) {
      bestThrow = throwDistances[0].throw;
    }

    if (!bestThrow) break;

    // Add the throw to the route
    route.push({
      ...bestThrow,
      isThrow: true
    });

    // Update for next iteration
    currentPoint = bestThrow;
    const index = remainingThrows.findIndex(t => t.id === bestThrow!.id);
    remainingThrows.splice(index, 1);

    // Update distances from new current point for remaining throws
    throwDistances = remainingThrows.map(t => ({
      throw: t,
      distance: calculateDistance(
        currentPoint.latitude,
        currentPoint.longitude,
        t.latitude,
        t.longitude,
        false
      )
    }));
  }

  return {
    points: route,
    remainingThrows,
    collectedThrows
  };
}; 