import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTutorial } from '../context/TutorialContext';

export const TutorialMessage = () => {
  const { showTutorial, currentStep, tutorialSteps, showMessage } = useTutorial();

  if (!showTutorial || !tutorialSteps[currentStep]?.message || !showMessage) return null;

  return (
    <View style={styles.container}>
      <View style={styles.messageBox}>
        <Text style={styles.messageText}>
          {tutorialSteps[currentStep].message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  messageBox: {
    backgroundColor: 'rgba(52, 73, 94, 0.9)',
    padding: 15,
    borderRadius: 10,
    maxWidth: '90%',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
}); 