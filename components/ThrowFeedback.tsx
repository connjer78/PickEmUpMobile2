import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, View } from 'react-native';

interface Props {
  messages: string[];
}

export const ThrowFeedback: React.FC<Props> = ({ messages }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (messages.length > 0) {
      // Reset opacity and start fade-in
      fadeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1900), // Increased from 1500 to match total timing
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {messages.map((message, index) => (
        <Text key={index} style={[
          styles.text,
          index > 0 && styles.subsequentMessage
        ]}>
          {message}
        </Text>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
    textAlign: 'center',
  },
  subsequentMessage: {
    marginTop: 10,
  },
}); 