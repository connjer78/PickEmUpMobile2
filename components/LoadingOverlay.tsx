import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import YellowDisc from '../assets/yellow-disc.svg';

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
  const spinValue = useRef(new Animated.Value(0)).current;
  const spinAnimation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // Reset the spin value and stop any existing animation
    const cleanup = () => {
      if (spinAnimation.current) {
        spinAnimation.current.stop();
        spinAnimation.current = null;
      }
      spinValue.setValue(0);
    };

    if (isVisible && showSpinner) {
      cleanup(); // Clean up before starting new animation
      spinAnimation.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinAnimation.current.start();
    }

    return cleanup;
  }, [isVisible, showSpinner, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showSpinner && (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <YellowDisc width={100} height={100} />
          </Animated.View>
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
  message: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 12,
  },
}); 