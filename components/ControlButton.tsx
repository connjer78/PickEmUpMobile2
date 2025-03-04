import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ControlButtonProps {
  label: string;
  onPress: () => void;
  isActive: boolean;
}

export const ControlButton: React.FC<ControlButtonProps> = ({
  label,
  onPress,
  isActive,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isActive && styles.activeButton,
      ]}
      onPress={onPress}
      disabled={isActive}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: '#1abc9c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 