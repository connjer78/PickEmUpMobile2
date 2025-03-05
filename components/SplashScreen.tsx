import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text, TouchableOpacity, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Part1 from '../assets/part1.svg';
import Part2 from '../assets/part2.svg';
import Part3 from '../assets/part3.svg';
import Logotype from '../assets/logotype.svg';
import ContinueButton from '../assets/continue.svg';
import { ThrowMarkerDot } from './ThrowMarkerDot';
import { UserLocationMarker } from './UserLocationMarker';
import { APP_VERSION } from '../config';

const { width, height } = Dimensions.get('window');

// Calculate landscape dimensions to maintain aspect ratio while covering width
const LANDSCAPE_ASPECT = 1250 / 1791.1;
const landscapeHeight = width / LANDSCAPE_ASPECT;

// Define marker positions (relative to container)
const MARKERS = [
  { x: width * 0.3, y: height * 0.6 },
  { x: width * 0.5, y: height * 0.4 },
  { x: width * 0.7, y: height * 0.55 },
];

// Starting point for markers and path
const START_POINT = { x: width * 0.5, y: height * 0.8 };

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const progress = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const [animationsComplete, setAnimationsComplete] = useState(false);

  // Landscape animations (0 to 3)
  const part1TranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [landscapeHeight, 0],
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

  const part2Opacity = progress.interpolate({
    inputRange: [1, 2],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const pushTranslateY = progress.interpolate({
    inputRange: [2, 3],
    outputRange: [0, -landscapeHeight],
    extrapolate: 'clamp',
  });

  const part3TranslateY = progress.interpolate({
    inputRange: [2, 3],
    outputRange: [landscapeHeight, -2],
    extrapolate: 'clamp',
  });

  // User location marker (3 to 3.5)
  const userMarkerOpacity = progress.interpolate({
    inputRange: [3, 3.5],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Disc markers (3.5 to 4)
  const markersScale = progress.interpolate({
    inputRange: [3.5, 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Path (4 to 5)
  const pathOpacity = progress.interpolate({
    inputRange: [4, 5],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Continue button (4.8 to 5)
  const continueOpacity = progress.interpolate({
    inputRange: [4.8, 5],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Calculate path string
  const pathD = `M ${START_POINT.x} ${START_POINT.y} 
                L ${MARKERS[0].x} ${MARKERS[0].y} 
                L ${MARKERS[1].x} ${MARKERS[1].y} 
                L ${MARKERS[2].x} ${MARKERS[2].y}`;

  const runAnimationSequence = () => {
    Animated.sequence([
      // First step: Part 1 and logotype animate together
      Animated.timing(progress, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Add a delay
      Animated.delay(1000),
      // Second step: Part 2 fades in
      Animated.timing(progress, {
        toValue: 2,
        duration: 800,
        useNativeDriver: true,
      }),
      // Third step: Part 3 pushes up
      Animated.timing(progress, {
        toValue: 3,
        duration: 800,
        useNativeDriver: true,
      }),
      // Fourth step: User location marker
      Animated.timing(progress, {
        toValue: 3.5,
        duration: 400,
        useNativeDriver: true,
      }),
      // Fifth step: Disc markers
      Animated.timing(progress, {
        toValue: 4,
        duration: 800,
        useNativeDriver: true,
      }),
      // Sixth step: Path
      Animated.timing(progress, {
        toValue: 5,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAnimationsComplete(true);
    });
  };

  useEffect(() => {
    setTimeout(runAnimationSequence, 500);
  }, []);

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
        {/* Part 1 */}
        <Animated.View 
          style={[
            styles.landscape,
            { 
              transform: [
                { translateY: part1TranslateY },
                { translateY: pushTranslateY }
              ],
            }
          ]}
        >
          <Part1 
            width={width} 
            height={landscapeHeight}
            preserveAspectRatio="xMidYMax slice"
          />
        </Animated.View>

        {/* Part 2 */}
        <Animated.View 
          style={[
            styles.landscape,
            { 
              opacity: part2Opacity,
              transform: [{ translateY: pushTranslateY }],
            }
          ]}
        >
          <Part2 
            width={width} 
            height={landscapeHeight}
            preserveAspectRatio="xMidYMax slice"
          />
        </Animated.View>

        {/* Part 3 */}
        <Animated.View 
          style={[
            styles.landscape,
            { 
              transform: [{ translateY: part3TranslateY }],
            }
          ]}
        >
          <Part3 
            width={width} 
            height={landscapeHeight}
            preserveAspectRatio="xMidYMax slice"
          />
        </Animated.View>

        {/* Overlay container for markers and path */}
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

          {/* Disc Markers */}
          {MARKERS.map((pos, index) => (
            <Animated.View
              key={index}
              style={[
                styles.markerContainer,
                {
                  transform: [
                    { translateX: -15 },
                    { translateY: -15 },
                    { translateX: progress.interpolate({
                      inputRange: [3.5, 4],
                      outputRange: [START_POINT.x, pos.x],
                      extrapolate: 'clamp',
                    })},
                    { translateY: progress.interpolate({
                      inputRange: [3.5, 4],
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

          {/* User Location Marker */}
          <Animated.View 
            style={[
              styles.markerContainer,
              {
                opacity: userMarkerOpacity,
                transform: [
                  { translateX: -15 },
                  { translateY: -15 },
                  { translateX: START_POINT.x },
                  { translateY: START_POINT.y },
                ],
                zIndex: 10,
              }
            ]}
          >
            <UserLocationMarker size={30} />
          </Animated.View>
        </View>

        {/* Logotype */}
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

        {/* Version Info */}
        <Animated.View 
          style={[
            styles.versionContainer,
            { 
              opacity: logotypeOpacity,
              transform: [{ translateX: logotypeTranslateX }],
            }
          ]}
        >
          <Text style={styles.versionText}>
            v{APP_VERSION}
          </Text>
        </Animated.View>
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
  landscape: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: landscapeHeight,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
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
  logotype: {
    position: 'absolute',
    top: height * 0.15,
    left: width * 0.1,
    width: width * 0.8,
    alignItems: 'center',
    height: width * 0.5,
    zIndex: 10,
  },
  versionContainer: {
    position: 'absolute',
    bottom: height * 0.03, // Position at bottom 3% of screen instead of 5%
    left: width * 0.1,
    width: width * 0.8,
    alignItems: 'center',
    zIndex: 10,
  },
  versionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  continueButton: {
    marginTop: height * 0.025 + 24, // 2.5% of screen height plus original margin
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 