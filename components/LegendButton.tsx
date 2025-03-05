import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text, Dimensions, Animated } from 'react-native';
import { LegendModal } from './LegendModal';
import { useMeasureComponent } from '../hooks/useMeasureComponent';
import { useTutorial } from '../context/TutorialContext';

const { width } = Dimensions.get('window');
const QUARTER_WIDTH = width / 4;

export const LegendButton: React.FC = () => {
  const { currentStep, showTutorial, deactivateButton, nextStep, clearMessage } = useTutorial();
  const measureLegend = useMeasureComponent(4); // Fifth tutorial step
  const [showLegend, setShowLegend] = useState(false);
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
    if (showTutorial && currentStep === 4) {
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
    if (showTutorial && currentStep === 4) {
      clearMessage();
      stopAnimation();
    }
    setShowLegend(true);
  };

  const handleClose = () => {
    setShowLegend(false);
    if (showTutorial && currentStep === 4) {
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
            zIndex: showTutorial && currentStep === 4 ? 2000 : 1
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.button}
          onLayout={showTutorial && currentStep === 4 ? measureLegend : undefined}
          onPress={handlePress}
        >
          <Text style={styles.buttonText}>Legend</Text>
        </TouchableOpacity>
      </Animated.View>

      <LegendModal 
        visible={showLegend}
        onClose={handleClose}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: (QUARTER_WIDTH * 3) - 20,
    width: QUARTER_WIDTH - 8,
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