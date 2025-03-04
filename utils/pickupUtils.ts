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

  let nearestThrow = availableThrows[0];
  let minDistance = calculateDistance(
    point.latitude,
    point.longitude,
    nearestThrow.latitude,
    nearestThrow.longitude,
    false
  );

  for (const t of availableThrows.slice(1)) {
    const distance = calculateDistance(
      point.latitude,
      point.longitude,
      t.latitude,
      t.longitude,
      false
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestThrow = t;
    }
  }

  return nearestThrow;
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
  const route: RoutePoint[] = [{
    ...currentLocation,
    id: 'current',
    isThrow: false
  }];

  const remainingThrows = [...throws];
  let currentPoint = currentLocation;

  while (remainingThrows.length > 0) {
    // Find nearest throw that won't create crossing paths
    let bestThrow: Throw | null = null;
    let minDistance = Infinity;

    for (const t of remainingThrows) {
      if (collectedThrows.some(ct => ct.id === t.id)) continue;

      const distance = calculateDistance(
        currentPoint.latitude,
        currentPoint.longitude,
        t.latitude,
        t.longitude,
        false
      );

      // Check if this path would cross any existing paths
      if (!wouldCrossPath(currentPoint, t, route) && distance < minDistance) {
        minDistance = distance;
        bestThrow = t;
      }
    }

    // If we couldn't find a throw without crossing paths, just take the nearest
    if (!bestThrow) {
      bestThrow = findNearestThrow(currentPoint, remainingThrows, collectedThrows);
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
  }

  return {
    points: route,
    remainingThrows,
    collectedThrows
  };
}; 