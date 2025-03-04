import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  size?: number;
}

export const UserLocationMarker: React.FC<Props> = ({ size = 20 }) => {
  // Calculate sizes based on the provided size prop
  const scale = size / 20;  // Base size is 20
  
  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        transform: [{ scale }],
      }
    ]}>
      {/* White outline/glow effect */}
      <View style={styles.outlineHead} />
      <View style={styles.outlineShoulders} />
      {/* Blue marker */}
      <View style={styles.head} />
      <View style={styles.shoulders} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -1 }], // Center adjustment
  },
  // White outline layers
  outlineHead: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    top: 2,
  },
  outlineShoulders: {
    position: 'absolute',
    width: 22,
    height: 12,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    backgroundColor: '#fff',
    top: 14,
  },
  // Blue marker layers
  head: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3498db',  // blue
    borderWidth: 1,
    borderColor: '#000',
    top: 3,
  },
  shoulders: {
    position: 'absolute',
    width: 20,
    height: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#3498db',  // blue
    borderWidth: 1,
    borderColor: '#000',
    borderBottomWidth: 0,
    top: 15,
  },
}); 