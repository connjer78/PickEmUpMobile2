import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ThrowStats {
  numberOfThrows: number;
  averageDistance: number;
  averageDegreesOffline: number;
  longestThrow: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  stats?: ThrowStats;
}

export const ThrowStatsModal: React.FC<Props> = ({
  visible,
  onClose,
  stats
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Throw Statistics</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.statRow}>
              Number of throws: {stats?.numberOfThrows || 0}
            </Text>
            <Text style={styles.statRow}>
              Average Distance: {stats?.averageDistance.toFixed(1) || 0} ft
            </Text>
            <Text style={styles.statRow}>
              Average Degrees Offline: {stats?.averageDegreesOffline.toFixed(1) || 0}°
            </Text>
            <Text style={styles.statRow}>
              Longest Throw: {stats?.longestThrow.toFixed(1) || 0} ft
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statRow: {
    fontSize: 16,
    marginVertical: 5,
  },
  closeButton: {
    backgroundColor: '#2c3e50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 