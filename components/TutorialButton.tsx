import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTutorial } from '../context/TutorialContext';

const { width } = Dimensions.get('window');
const QUARTER_WIDTH = width / 4;

interface TutorialButtonProps {
  onPress: () => void;
  isActive: boolean;
}

export const TutorialButton: React.FC<TutorialButtonProps> = ({ isActive }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const { showTutorial, startTutorial, endTutorial } = useTutorial();

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      bounceAnim.setValue(0);
    }
  }, [isActive]);

  const handlePress = () => {
    if (showTutorial) {
      endTutorial();
    } else {
      startTutorial();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{
            translateY: bounceAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -20],
            })
          }],
          zIndex: showTutorial ? 2000 : 1,
        }
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.button,
          showTutorial && styles.exitButton
        ]}
      >
        <Text style={styles.buttonText}>
          {showTutorial ? 'Exit Tutorial' : 'Tutorial'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 227,  // 127px (Stats right) + 90px Stats width + 10px gap
    minWidth: 100,
  },
  button: {
    backgroundColor: '#2c3e50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  exitButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 