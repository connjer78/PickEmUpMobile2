import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, Animated, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useAppState } from '../context/AppStateContext';
import { ConfirmModal } from './ConfirmModal';
import { ExitPickupModeModal } from './ExitPickupModeModal';
import { PickupModeModal } from './PickupModeModal';
import { useMeasureComponent } from '../hooks/useMeasureComponent';
import { useTutorial } from '../context/TutorialContext';

export const Controls = () => {
  const { 
    buttonStates, 
    mode,
    throwData,
    setMode,
    setInstructionMessage,
    setThrowData,
    resetThrows,
    showResetModal,
    hideResetModal,
    isResetModalVisible,
    showPickupModeModal,
    modals,
    showExitPickupModeModal,
    hideExitPickupModeModal,
    exitPickupMode,
    hidePickupModeModal,
    confirmPickupMode,
    startPickupMode,
    pickupModeStage,
    calculateThrowStats
  } = useAppState();
  const { currentStep, showTutorial, deactivateButton, nextStep, clearMessage } = useTutorial();
  const measureSetTarget = useMeasureComponent(0);  // First tutorial step
  const measurePickupMode = useMeasureComponent(5); // Last tutorial step
  const bounceAnim = React.useRef(new Animated.Value(1)).current;
  const animationRef = React.useRef<Animated.CompositeAnimation | null>(null);
  const AnimatedTouchable = React.useMemo(() => Animated.createAnimatedComponent(TouchableOpacity), []);
  const [isSettingTargetLoading, setIsSettingTargetLoading] = useState(false);

  const stopAnimation = React.useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
    bounceAnim.setValue(1);
  }, [bounceAnim]);

  const startAnimation = React.useCallback(() => {
    stopAnimation();
    
    // Initial bounce - faster and more pronounced
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.3,  // Bigger initial bounce
        duration: 150, // Faster
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 150, // Faster
        useNativeDriver: true,
      })
    ]).start(() => {
      // Start the continuous loop - faster cycle
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.15,  // Slightly bigger continuous bounce
            duration: 400,  // Much faster
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 400,  // Much faster
            useNativeDriver: true,
          })
        ])
      );
      animationRef.current.start();
    });
  }, [bounceAnim, stopAnimation]);

  useEffect(() => {
    // Start animation only for the current step's button
    if (showTutorial) {
      if (currentStep === 0 || currentStep === 1 || currentStep === 5) {
        startAnimation();
      } else {
        stopAnimation();
      }
    } else {
      stopAnimation();
    }

    return () => {
      stopAnimation();
    };
  }, [showTutorial, currentStep, startAnimation, stopAnimation]);

  // Add a separate effect to handle animation value reset
  useEffect(() => {
    if (!showTutorial || 
        (currentStep !== 0 && currentStep !== 1 && currentStep !== 5)) {
      bounceAnim.setValue(1);
    }
  }, [showTutorial, currentStep, bounceAnim]);

  const handleSetTarget = async () => {
    if (isSettingTargetLoading) return; // Prevent multiple presses while loading
    
    // Clear tutorial message and stop animation if this is the current tutorial step
    if (showTutorial && currentStep === 0) {
      stopAnimation();
      clearMessage();
    }
    
    deactivateButton();
    
    if (!buttonStates.isSettingTarget) {
      // If we're already in range set mode, toggle between throwMarking and settingTarget
      if (mode === 'settingTarget') {
        setMode('throwMarking');
        setInstructionMessage(null);
      } else {
        setMode('settingTarget');
        setInstructionMessage('Tap the map to select the target.');
      }
      return;
    }

    try {
      setIsSettingTargetLoading(true);
      
      // Check location permissions first
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setInstructionMessage('Location permission is required to set a target.');
        setIsSettingTargetLoading(false);
        return;
      }

      // Check if location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setInstructionMessage('Please enable location services to set a target.');
        setIsSettingTargetLoading(false);
        return;
      }

      // Get a fresh location fix
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest
      });
      
      const userLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
      
      setThrowData({ 
        ...throwData,
        userLocation,
        rangeTarget: null,
        bearing: null
      });
      setMode('settingTarget');
      setInstructionMessage('Tap the map to select the target.');
    } catch (error) {
      console.log('Error getting location:', error);
      setInstructionMessage('Unable to get location. Please try again.');
    } finally {
      setIsSettingTargetLoading(false);
    }
  };

  const handleMarkThrow = () => {
    deactivateButton();
    
    // Clear tutorial message and stop animation if this is the current tutorial step
    if (showTutorial && currentStep === 1) {
      stopAnimation();
      clearMessage();
    }
    
    if (buttonStates.markThrowActive) {
      setMode('markingThrow');
      setInstructionMessage('Tap the map where your throw landed.');
    }
  };

  const handleReset = () => {
    deactivateButton();
    if (buttonStates.resetThrowsActive) {
      showResetModal();
    }
  };

  const handleConfirmReset = () => {
    resetThrows();
    hideResetModal();
  };

  const handlePickupMode = () => {
    deactivateButton();
    if (mode === 'pickup') {
      showExitPickupModeModal();
    } else if (buttonStates.pickupModeActive) {
      showPickupModeModal();
    }
  };

  return (
    <>
      <View 
        style={[
          styles.container,
          { zIndex: showTutorial ? 2000 : 1 }
        ]}
        onLayout={(event) => {
          const { y } = event.nativeEvent.layout;
          if (y > 0) {
            measureSetTarget(event);
          }
        }}
      >
        <View style={styles.topButtons}>
          <AnimatedTouchable 
            style={[
              styles.button,
              mode === 'settingTarget' ? styles.inactiveButton :
              buttonStates.setTargetActive && styles.activeButton,
              showTutorial && currentStep === 0 && styles.highlightedButton,
              {
                transform: [{ 
                  scale: showTutorial && currentStep === 0 ? bounceAnim : 1 
                }]
              }
            ]}
            onPress={handleSetTarget}
            disabled={mode === 'settingTarget' || isSettingTargetLoading}
            onLayout={measureSetTarget}
          >
            {isSettingTargetLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>
                {buttonStates.isSettingTarget ? 'Set Target' : 'Reset Target'}
              </Text>
            )}
          </AnimatedTouchable>
          
          <AnimatedTouchable 
            style={[
              styles.button,
              mode === 'markingThrow' ? styles.inactiveButton :
              buttonStates.markThrowActive && styles.activeButton,
              showTutorial && currentStep === 1 && styles.highlightedButton,
              {
                transform: [{ 
                  scale: showTutorial && currentStep === 1 ? bounceAnim : 1 
                }]
              }
            ]}
            onPress={handleMarkThrow}
            disabled={mode === 'markingThrow'}
          >
            <Text style={styles.buttonText}>Mark Throw</Text>
          </AnimatedTouchable>

          <AnimatedTouchable 
            style={[
              styles.button,
              buttonStates.resetThrowsActive && styles.dangerButton,
              showTutorial && currentStep === 2 && styles.highlightedButton,
              {
                transform: [{ 
                  scale: showTutorial && currentStep === 2 ? bounceAnim : 1 
                }]
              }
            ]}
            onPress={handleReset}
          >
            <Text style={styles.buttonText}>Reset Throws</Text>
          </AnimatedTouchable>
        </View>

        <AnimatedTouchable 
          style={[
            styles.pickupButton,
            mode === 'pickup' ? styles.exitPickupButton : 
            !buttonStates.pickupModeActive && styles.inactiveButton,
            showTutorial && currentStep === 5 && styles.highlightedButton,
            {
              transform: [{ 
                scale: showTutorial && currentStep === 5 ? bounceAnim : 1 
              }]
            }
          ]}
          onPress={handlePickupMode}
          onLayout={measurePickupMode}
        >
          <Text style={styles.pickupButtonText}>
            {mode === 'pickup' ? 'Exit Pickup Mode' : 'Pickup Mode'}
          </Text>
        </AnimatedTouchable>
      </View>
      <ConfirmModal
        visible={isResetModalVisible}
        onConfirm={handleConfirmReset}
        onCancel={hideResetModal}
        message="Are you sure you want to remove all throws from the map?"
        confirmText="Reset Throws"
        confirmButtonColor="#e74c3c"  // red
      />
      <ExitPickupModeModal
        visible={modals.exitPickupMode}
        onConfirm={exitPickupMode}
        onCancel={hideExitPickupModeModal}
      />
      <PickupModeModal
        visible={modals.pickupMode}
        onCancel={hidePickupModeModal}
        onConfirm={pickupModeStage === 'confirmation' ? confirmPickupMode : startPickupMode}
        stage={pickupModeStage || 'confirmation'}
        stats={calculateThrowStats() || undefined}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#34495e',
    paddingHorizontal: 5,
    paddingBottom: 8,
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 8,
  },
  button: {
    backgroundColor: '#2c3e50',
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#3498db',
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  inactiveButton: {
    backgroundColor: '#2c3e50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  pickupButton: {
    backgroundColor: '#27ae60',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    marginTop: 8,
    alignItems: 'center',
  },
  pickupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exitPickupButton: {
    backgroundColor: '#e74c3c',
  },
  highlightedButton: {
    elevation: 6,
    backgroundColor: '#3498db',
  },
}); 