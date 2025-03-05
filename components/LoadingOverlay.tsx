import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  showSpinner?: boolean;
}

const { width, height } = Dimensions.get('window');

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = 'Loading...', 
  showSpinner = true 
}) => {
  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showSpinner && (
          <ActivityIndicator 
            size="large" 
            color="#8e44ad"
            style={styles.spinner}
          />
        )}
        {message && (
          <Text style={styles.message}>{message}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(52, 73, 94, 0.5)', // Semi-transparent background
  },
  content: {
    backgroundColor: 'rgba(52, 73, 94, 0.9)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    maxWidth: width * 0.8,
  },
  spinner: {
    marginBottom: 12,
  },
  message: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
}); 