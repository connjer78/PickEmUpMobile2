import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ThrowStats {
  numberOfThrows: number;
  averageDistance: number;
  averageDegreesOffline: number;
  longestThrow: number;
}

interface Props {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  stats?: ThrowStats;
  stage: 'confirmation' | 'stats';
}

export const PickupModeModal: React.FC<Props> = ({
  visible,
  onCancel,
  onConfirm,
  stats,
  stage
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {stage === 'confirmation' ? (
            <>
              <Text style={styles.title}>Are all throws marked?</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={onCancel}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.confirmButton]} 
                  onPress={onConfirm}
                >
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
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
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={onCancel}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.startButton]} 
                  onPress={onConfirm}
                >
                  <Text style={styles.buttonText}>Start Pickup</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  confirmButton: {
    backgroundColor: '#44bb44',
  },
  startButton: {
    backgroundColor: '#4444ff',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
  },
  statRow: {
    fontSize: 16,
    marginVertical: 5,
  },
}); 