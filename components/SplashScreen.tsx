import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text, TouchableOpacity, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import InitialLandscape from '../assets/initial-landscape.svg';
import SecondaryLandscape from '../assets/secondary-landscape.svg';
import Logotype from '../assets/logotype.svg';
import ContinueButton from '../assets/continue.svg';
import { ThrowMarkerDot } from './ThrowMarkerDot';
import { UserLocationMarker } from './UserLocationMarker';
import { APP_VERSION } from '../config';

const { width, height } = Dimensions.get('window');

// Calculate landscape dimensions to maintain aspect ratio while covering width
const SECONDARY_LANDSCAPE_ASPECT = 1250 / 1791.1;
const INITIAL_LANDSCAPE_ASPECT = 1250 / 1791.1;
const secondaryLandscapeHeight = width / SECONDARY_LANDSCAPE_ASPECT;
const initialLandscapeHeight = width / INITIAL_LANDSCAPE_ASPECT;

// Define marker positions (relative to secondary landscape container)
const MARKERS = [
  { x: width * 0.3, y: height * 0.7 },
  { x: width * 0.5, y: height * 0.5 },
  { x: width * 0.7, y: height * 0.65 },
];

// Starting point for markers and path
const START_POINT = { x: width * 0.5, y: height * 0.9 };

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const progress = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationsComplete, setAnimationsComplete] = useState(false);

  // Updated interpolated values to start from 0 instead of 1
  const initialLandscapeOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const initialLandscapeTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
    extrapolate: 'clamp',
  });

  const logotypeOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const logotypeTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, 0],
    extrapolate: 'clamp',
  });

  // Secondary landscape comes in second
  const secondaryLandscapeOpacity = progress.interpolate({
    inputRange: [1, 2],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const secondaryLandscapeTranslateY = progress.interpolate({
    inputRange: [1, 2],
    outputRange: [100, 0],
    extrapolate: 'clamp',
  });

  // User location marker fades in third
  const userMarkerOpacity = progress.interpolate({
    inputRange: [2, 2.5],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Red markers animate fourth
  const markersScale = progress.interpolate({
    inputRange: [2.5, 3],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Purple path appears last
  const pathOpacity = progress.interpolate({
    inputRange: [3, 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Continue button fades in after everything
  const continueOpacity = progress.interpolate({
    inputRange: [3.8, 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Calculate path string
  const pathD = `M ${START_POINT.x} ${START_POINT.y} 
                 L ${MARKERS[0].x} ${MARKERS[0].y} 
                 L ${MARKERS[1].x} ${MARKERS[1].y} 
                 L ${MARKERS[2].x} ${MARKERS[2].y}`;

  const animate = (toValue: number) => {
    setIsAnimating(true);
    Animated.timing(progress, {
      toValue,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setIsAnimating(false);
      setCurrentStep(toValue);
    });
  };

  const handleTap = () => {
    if (isAnimating) {
      return;
    }

    switch (currentStep) {
      case 0:
        animate(1);
        break;
      case 1:
        animate(2);
        break;
      case 2:
        animate(3);
        break;
      case 3:
        animate(4);
        break;
      case 4:
        animate(5);
        break;
      case 5:
        animate(6);
        break;
      case 6:
        setTimeout(onComplete, 1000);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setCurrentStep(0);
  }, []);

  const runAnimationSequence = () => {
    Animated.sequence([
      // First step: Initial landscape and logotype animate together
      Animated.timing(progress, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Add a delay after the first animation
      Animated.delay(1000),
      // Second step: Secondary landscape
      Animated.timing(progress, {
        toValue: 2,
        duration: 800,
        useNativeDriver: true,
      }),
      // Third step: User location marker
      Animated.timing(progress, {
        toValue: 2.5,
        duration: 400,
        useNativeDriver: true,
      }),
      // Fourth step: Red markers
      Animated.timing(progress, {
        toValue: 3,
        duration: 800,
        useNativeDriver: true,
      }),
      // Fifth step: Purple path
      Animated.timing(progress, {
        toValue: 4,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAnimationsComplete(true);
    });
  };

  useEffect(() => {
    // Start animation sequence after a short delay
    setTimeout(runAnimationSequence, 500);
  }, []);

  // Add bounce animation with gravitational motion
  useEffect(() => {
    if (animationsComplete) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          })
        ])
      ).start();
    }
  }, [animationsComplete]);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Animated.View 
          style={[
            styles.initialLandscape,
            { 
              opacity: initialLandscapeOpacity,
              transform: [{ translateY: initialLandscapeTranslateY }],
            }
          ]}
        >
          <View style={styles.initialLandscapeContainer}>
            <InitialLandscape 
              width={width} 
              height={initialLandscapeHeight}
              preserveAspectRatio="xMidYMax slice"
            />
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.logotype,
            { 
              opacity: logotypeOpacity,
              transform: [{ translateX: logotypeTranslateX }],
            }
          ]}
        >
          <Logotype width={width * 0.8} height={width * 0.25} />
          <Animated.Text 
            style={[
              styles.versionText,
              { opacity: logotypeOpacity }
            ]}
          >
            v{APP_VERSION}
          </Animated.Text>
          {animationsComplete && (
            <Animated.View style={{ 
              opacity: continueOpacity,
              transform: [{
                translateY: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                  extrapolate: 'clamp'
                })
              }]
            }}>
              <TouchableOpacity 
                onPress={onComplete}
                style={styles.continueButton}
              >
                <ContinueButton width={width * 0.3} height={30} />
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>

        <Animated.View 
          style={[
            styles.secondaryLandscape,
            { 
              opacity: secondaryLandscapeOpacity,
              transform: [{ translateY: secondaryLandscapeTranslateY }],
            }
          ]}
        >
          <View style={styles.secondaryLandscapeContainer}>
            <SecondaryLandscape 
              width={width} 
              height={secondaryLandscapeHeight}
              preserveAspectRatio="xMidYMax slice"
            />
          </View>
        </Animated.View>

        {/* Add markers and path container */}
        <View style={styles.overlayContainer}>
          {/* Path */}
          <Animated.View style={{ opacity: pathOpacity }}>
            <Svg width={width} height={height}>
              <Path
                d={pathD}
                stroke="#8e44ad"
                strokeWidth="6"
                fill="none"
              />
            </Svg>
          </Animated.View>

          {/* Markers */}
          {MARKERS.map((pos, index) => (
            <Animated.View
              key={index}
              style={[
                styles.markerContainer,
                {
                  transform: [
                    { translateX: -15 },  // Adjusted for larger marker
                    { translateY: -15 },  // Adjusted for larger marker
                    { translateX: progress.interpolate({
                      inputRange: [2.5, 3],
                      outputRange: [START_POINT.x, pos.x],
                      extrapolate: 'clamp',
                    })},
                    { translateY: progress.interpolate({
                      inputRange: [2.5, 3],
                      outputRange: [START_POINT.y, pos.y],
                      extrapolate: 'clamp',
                    })},
                    { scale: markersScale }
                  ],
                },
              ]}
            >
              <ThrowMarkerDot
                coordinate={{ latitude: 0, longitude: 0 }}
                markerColor="red"
                isSelected={false}
                mode="throwMarking"
                index={index}
                onPress={() => {}}
                size={30}
                isAnimated={true}
              />
            </Animated.View>
          ))}

          {/* User Location Marker - Moved to end for highest z-index */}
          <Animated.View 
            style={[
              styles.markerContainer,
              {
                opacity: userMarkerOpacity,
                transform: [
                  { translateX: -15 },  // Adjusted for larger marker
                  { translateY: -15 },  // Adjusted for larger marker
                  { translateX: START_POINT.x },
                  { translateY: START_POINT.y },
                ],
                zIndex: 10,  // Ensure it's above the path
              }
            ]}
          >
            <UserLocationMarker size={30} />
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#34495e',
  },
  contentContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  initialLandscape: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.4,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  initialLandscapeContainer: {
    width: width,
    height: height * 0.4,
    overflow: 'hidden',
  },
  secondaryLandscape: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.6,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  secondaryLandscapeContainer: {
    width: width,
    height: height * 0.6,
    overflow: 'hidden',
  },
  logotype: {
    position: 'absolute',
    top: height * 0.15,
    left: width * 0.1,
    width: width * 0.8,
    alignItems: 'center',
    height: width * 0.5,
  },
  overlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height,
    width: width,
    pointerEvents: 'none',
  },
  markerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  continueButton: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 