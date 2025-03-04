import React from 'react';
import { ThrowMarker } from './ThrowMarker';
import { useAppState } from '../context/AppStateContext';

export const ThrowMarkersOverlay = () => {
  const { throwData } = useAppState();

  return (
    <>
      {throwData.throws.map((throwPoint, index) => (
        <ThrowMarker
          key={`throw-${index}`}
          coordinate={throwPoint}
          index={index}
        />
      ))}
    </>
  );
}; 