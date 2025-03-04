import React, { useState, useEffect } from 'react';
import { Polyline } from 'react-native-maps';
import { Coordinates } from '../context/AppStateContext';
import { calculateDistance, calculateRangeLines, calculateArcPoints } from '../utils/distanceUtils';

interface Props {
  userLocation: Coordinates;
  target: Coordinates;
  bearing: number;
}

export const RangeLines = React.memo(({ userLocation, target, bearing }: Props) => {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    target.latitude,
    target.longitude,
    true
  );
  
  const leftBearing = (bearing - 20 + 360) % 360;
  const rightBearing = (bearing + 20 + 360) % 360;
  
  const { leftLine, rightLine } = calculateRangeLines(
    userLocation,
    target,
    bearing,
    distance
  );

  const arcPoints = calculateArcPoints(
    userLocation,
    distance,
    leftBearing,
    rightBearing
  );

  return (
    <>
      <Polyline
        coordinates={[userLocation, target]}
        strokeColor="#fff"
        strokeWidth={2}
      />
      <Polyline
        coordinates={leftLine}
        strokeColor="#fff"
        strokeWidth={2}
      />
      <Polyline
        coordinates={rightLine}
        strokeColor="#fff"
        strokeWidth={2}
      />
      <Polyline
        coordinates={arcPoints}
        strokeColor="#fff"
        strokeWidth={2}
      />
    </>
  );
}); 