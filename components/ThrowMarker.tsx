import React from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Coordinates } from '../context/AppStateContext';

interface Props {
  coordinate: Coordinates;
  index: number;
}

export const ThrowMarker = ({ coordinate, index }: Props) => {
  return (
    <Marker coordinate={coordinate}>
      <View style={{
        width: 12,
        height: 12,
        backgroundColor: '#ffeb3b',  // Yellow
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#000',
      }} />
    </Marker>
  );
}; 