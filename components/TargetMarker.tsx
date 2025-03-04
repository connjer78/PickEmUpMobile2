import React from 'react';
import { View, StyleSheet } from 'react-native';

export const TargetMarker = () => (
  <View style={styles.container}>
    <View style={styles.outerRing} />
    <View style={styles.middleRing} />
    <View style={styles.innerRing} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e74c3c',  // red
    borderWidth: 1,
    borderColor: '#000',
  },
  middleRing: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',  // white
    borderWidth: 1,
    borderColor: '#000',
  },
  innerRing: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',  // red
    borderWidth: 1,
    borderColor: '#000',
  },
}); 