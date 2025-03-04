import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { LegendModal } from './LegendModal';
import { useMeasureComponent } from '../hooks/useMeasureComponent';
import { useTutorial } from '../context/TutorialContext';

const { width } = Dimensions.get('window');
const QUARTER_WIDTH = width / 4;

export const LegendButton: React.FC = () => {
  const { currentStep, showTutorial, deactivateButton } = useTutorial();
  const measureLegend = useMeasureComponent(4); // Fifth tutorial step
  const [showLegend, setShowLegend] = useState(false);

  const handlePress = () => {
    deactivateButton();
    setShowLegend(true);
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.button}
        onLayout={showTutorial && currentStep === 4 ? measureLegend : undefined}
        onPress={handlePress}
      >
        <Text style={styles.buttonText}>Legend</Text>
      </TouchableOpacity>

      <LegendModal 
        visible={showLegend}
        onClose={() => setShowLegend(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20,
    left: (QUARTER_WIDTH * 3) - 20,
    width: QUARTER_WIDTH - 8,
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