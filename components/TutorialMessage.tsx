import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTutorial } from '../context/TutorialContext';
import { tutorialMessages } from '../context/TutorialContext';

const { width } = Dimensions.get('window');

export const TutorialMessage = () => {
  const { showTutorial, currentStep } = useTutorial();

  if (!showTutorial) return null;

  return (
    <View style={styles.container}>
      <View style={styles.messageBox}>
        <Text style={styles.message}>
          {tutorialMessages[currentStep]}
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
    zIndex: 2000,
  },
  messageBox: {
    backgroundColor: 'rgba(44, 62, 80, 0.95)', // Dark blue with transparency
    padding: 15,
    borderRadius: 10,
    maxWidth: width * 0.9,
    minWidth: width * 0.7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
}); 