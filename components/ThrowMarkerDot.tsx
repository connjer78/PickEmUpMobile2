import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Marker } from 'react-native-maps';
import { Coordinates } from '../context/AppStateContext';

interface Props {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  markerColor: string;
  isSelected: boolean;
  mode: string;
  index: number;
  onPress: () => void;
  size?: number;
  isAnimated?: boolean;
}

export const ThrowMarkerDot: React.FC<Props> = ({ 
  coordinate, 
  markerColor, 
  isSelected, 
  mode,
  index,
  onPress,
  size = 20,
  isAnimated = false
}) => {
  const baseSize = isSelected ? 18 : 12;
  const markerSize = mode === 'pickup' ? baseSize * 1.5 : baseSize;
  const hitSlop = mode === 'pickup' ? 25 : 15;

  const finalSize = isAnimated ? size : markerSize;

  return (
    <Marker
      coordinate={coordinate}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={isSelected ? 2 : 1}
      flat={true}
    >
      <TouchableOpacity 
        onPress={onPress}
        hitSlop={{ top: hitSlop, bottom: hitSlop, left: hitSlop, right: hitSlop }}
        style={[
          styles.touchable,
          mode === 'pickup' && {
            width: markerSize + (hitSlop * 2),
            height: markerSize + (hitSlop * 2),
          }
        ]}
      >
        <View style={[
          styles.markerContainer,
          {
            width: finalSize + 4,
            height: finalSize + 4,
          }
        ]}>
          <View
            style={[
              styles.markerDot,
              {
                width: finalSize,
                height: finalSize,
                borderRadius: finalSize / 2,
                backgroundColor: markerColor,
                borderWidth: isSelected ? 2 : 1,
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </Marker>
  );
};

const styles = StyleSheet.create({
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  markerDot: {
    borderColor: '#000',
    position: 'absolute',
  },
}); 