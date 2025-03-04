import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, Animated } from 'react-native';
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
  const { currentStep, showTutorial, deactivateButton } = useTutorial();
  const measureSetTarget = useMeasureComponent(0);  // First tutorial step
  const measurePickupMode = useMeasureComponent(5); // Last tutorial step
  const bounceAnim = React.useRef(new Animated.Value(1)).current;
  const AnimatedTouchable = React.useMemo(() => Animated.createAnimatedComponent(TouchableOpacity), []);

  useEffect(() => {
    if (showTutorial && (currentStep === 0 || currentStep === 1 || currentStep === 2 || currentStep === 5)) {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        // Repeat the animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            })
          ])
        ).start();
      });
    } else {
      bounceAnim.setValue(1);
    }
  }, [showTutorial, currentStep]);

  const handleSetTarget = async () => {
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
    } else {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest
        });
        
        const userLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
        
        setThrowData({ userLocation });
        setMode('settingTarget');
        setInstructionMessage('Tap the map to select the target.');
      } catch (error) {
        console.log('Error getting location:', error);
      }
    }
  };

  const handleMarkThrow = () => {
    deactivateButton();
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
            disabled={mode === 'settingTarget'}
            onLayout={measureSetTarget}
          >
            <Text style={styles.buttonText}>
              {buttonStates.isSettingTarget ? 'Set Target' : 'Reset Target'}
            </Text>
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