import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onMoveSelect: () => void;
  onDeleteSelect: () => void;
}

export const MarkerOptionsModal = ({ visible, onClose, onMoveSelect, onDeleteSelect }: Props) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.option}
            onPress={onMoveSelect}
          >
            <Text style={styles.optionText}>Move this marker</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            onPress={onDeleteSelect}
          >
            <Text style={styles.optionText}>Remove this marker</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            onPress={onClose}
          >
            <Text style={styles.optionText}>Cancel</Text>
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
    justifyContent: 'flex-end', // Align to bottom
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40, // Extra padding for bottom
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 18,
    textAlign: 'center',
  },
}); 