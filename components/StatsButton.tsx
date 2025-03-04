import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text, Dimensions, Animated } from 'react-native';
import { ThrowStatsModal } from './ThrowStatsModal';
import { useAppState } from '../context/AppStateContext';
import { useMeasureComponent } from '../hooks/useMeasureComponent';
import { useTutorial } from '../context/TutorialContext';

const { width } = Dimensions.get('window');
const QUARTER_WIDTH = width / 4;

export const StatsButton: React.FC = () => {
  const [showStats, setShowStats] = useState(false);
  const { calculateThrowStats } = useAppState();
  const { currentStep, showTutorial, deactivateButton, nextStep, clearMessage } = useTutorial();
  const measureStats = useMeasureComponent(3);
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const stopAnimation = () => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
    bounceAnim.setValue(1);
    rotateAnim.setValue(0);
  };

  const startAnimation = () => {
    stopAnimation();
    
    // Initial attention-grabbing animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(bounceAnim, {
          toValue: 1.3,  // Bigger initial bounce
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]),
      Animated.parallel([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ])
    ]).start(() => {
      // Continuous animation loop
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(bounceAnim, {
              toValue: 1.2,  // Increased continuous bounce
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0.5,  // Subtle rotation
              duration: 600,
              useNativeDriver: true,
            })
          ]),
          Animated.parallel([
            Animated.timing(bounceAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            })
          ])
        ])
      );
      animationRef.current.start();
    });
  };

  useEffect(() => {
    if (showTutorial && currentStep === 3) {
      startAnimation();
    } else {
      stopAnimation();
    }

    return () => {
      stopAnimation();
    };
  }, [showTutorial, currentStep]);

  const handlePress = () => {
    deactivateButton();
    if (showTutorial && currentStep === 3) {
      clearMessage();
      stopAnimation();
    }
    setShowStats(true);
  };

  const handleClose = () => {
    setShowStats(false);
    if (showTutorial && currentStep === 3) {
      nextStep();
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg']
  });

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { scale: bounceAnim },
              { rotate: spin }
            ],
            zIndex: showTutorial && currentStep === 3 ? 2000 : 1
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.button}
          onLayout={showTutorial && currentStep === 3 ? measureStats : undefined}
          onPress={handlePress}
        >
          <Text style={styles.buttonText}>Stats</Text>
        </TouchableOpacity>
      </Animated.View>

      <ThrowStatsModal 
        visible={showStats}
        onClose={handleClose}
        stats={calculateThrowStats() || undefined}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 127,  // 20px corner + 89px Legend width + 10px gap + 8px margins
    width: 90,
  },
  button: {
    backgroundColor: '#2c3e50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 