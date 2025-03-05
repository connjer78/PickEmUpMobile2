import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useTutorial } from '../context/TutorialContext';

const { height } = Dimensions.get('window');

export const TutorialMessage = () => {
  const { showTutorial, currentStep, tutorialSteps, showMessage, nextStep, clearMessage } = useTutorial();

  if (!showTutorial || !tutorialSteps[currentStep]?.message || !showMessage) return null;

  const isInformationalStep = currentStep === 2;
  const isBottomMessage = currentStep === 3 || currentStep === 4; // Stats and Legend button steps

  return (
    <View style={[
      styles.container,
      isBottomMessage ? styles.bottomContainer : styles.topContainer
    ]}>
      <View style={[
        styles.messageBox,
        isBottomMessage && styles.bottomMessageBox
      ]}>
        <Text style={styles.messageText}>
          {tutorialSteps[currentStep].message}
        </Text>
        {isInformationalStep && (
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={() => {
              clearMessage();
              nextStep();
            }}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  topContainer: {
    top: 20,
  },
  bottomContainer: {
    bottom: height * 0.15, // Position above the bottom buttons
  },
  messageBox: {
    backgroundColor: 'rgba(52, 73, 94, 0.9)',
    padding: 15,
    borderRadius: 10,
    maxWidth: '90%',
  },
  bottomMessageBox: {
    // Add any specific styling needed for bottom messages
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 12,
    alignSelf: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 