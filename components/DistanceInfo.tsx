import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useAppState } from '../context/AppStateContext';
import { useMeasureComponent } from '../hooks/useMeasureComponent';
import { useTutorial } from '../context/TutorialContext';

export const DistanceInfo: React.FC = () => {
  const { isMetric, toggleMetric, throwData } = useAppState();
  const { range, lastThrow, offCenter } = throwData;

  const formatDistance = (distance: number | null): string => {
    if (distance === null) return '--';
    if (isMetric) {
      return `${Math.round(distance)} m`;
    } else {
      return `${Math.round(distance)} ft`;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.distanceRow}>
        <Text style={styles.text}>Target: {formatDistance(range)}</Text>
        <Text style={styles.text}>Last Throw: {formatDistance(lastThrow)}</Text>
        <Text style={styles.text}>Off Center: {formatDistance(offCenter)}</Text>
        <TouchableOpacity 
          style={styles.unitsToggle}
          onPress={toggleMetric}
        >
          <View style={[
            styles.unitOption,
            !isMetric && styles.activeUnit
          ]}>
            <Text style={styles.unitText}>FT</Text>
          </View>
          <View style={[
            styles.unitOption,
            isMetric && styles.activeUnit
          ]}>
            <Text style={styles.unitText}>M</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#34495e',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  distanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 12,
  },
  unitsToggle: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50', // Darker than container
    borderRadius: 4,
    padding: 2,
  },
  unitOption: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  activeUnit: {
    backgroundColor: '#3498db', // Blue for active state
  },
  unitText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 