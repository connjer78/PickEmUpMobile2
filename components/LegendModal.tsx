import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserLocationMarker } from './UserLocationMarker';
import { TargetMarker } from './TargetMarker';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const LegendModal = ({ visible, onClose }: Props) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.legendItems}>
            {/* User Location */}
            <View style={styles.legendItem}>
              <UserLocationMarker />
              <Text style={styles.legendText}>Tee location</Text>
            </View>

            {/* Target */}
            <View style={styles.legendItem}>
              <TargetMarker />
              <Text style={styles.legendText}>Target</Text>
            </View>

            {/* Throw Markers */}
            <View style={styles.legendItem}>
              <View style={[styles.throwMarker, { backgroundColor: '#2ecc71' }]} />
              <Text style={styles.legendText}>On the line</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.throwMarker, { backgroundColor: '#f1c40f' }]} />
              <Text style={styles.legendText}>A little off the line</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.throwMarker, { backgroundColor: '#e74c3c' }]} />
              <Text style={styles.legendText}>Off the line</Text>
            </View>

            {/* Pickup Path */}
            <View style={styles.legendItem}>
              <View style={styles.pickupPathContainer}>
                <View style={styles.pickupPathLine} />
              </View>
              <Text style={styles.legendText}>Pickup path</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
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
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  legendItems: {
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  legendText: {
    marginLeft: 15,
    fontSize: 16,
  },
  throwMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#000',
  },
  closeButton: {
    backgroundColor: '#2c3e50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickupPathContainer: {
    width: 30,
    height: 12,
  },
  pickupPathLine: {
    width: 30,
    height: 12,
    backgroundColor: 'rgba(128, 0, 255, 0.7)',
    borderRadius: 6,
  },
}); 