import React, { useEffect } from 'react';
import { StyleSheet, Animated, Text } from 'react-native';

interface Props {
  message: string;
  visible: boolean;
  topPosition: number;
}

export const InstructionToast = ({ message, visible, topPosition }: Props) => {
  const translateY = new Animated.Value(-50);

  useEffect(() => {
    if (visible) {
      // Slide down
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide up
      Animated.spring(translateY, {
        toValue: -50,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        { top: topPosition },
        { transform: [{ translateY }] }
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#34495e',
    padding: 15,
    alignItems: 'center',
    zIndex: 2,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
}); 