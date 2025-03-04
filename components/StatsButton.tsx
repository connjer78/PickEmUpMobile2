import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { ThrowStatsModal } from './ThrowStatsModal';
import { useAppState } from '../context/AppStateContext';
import { useMeasureComponent } from '../hooks/useMeasureComponent';
import { useTutorial } from '../context/TutorialContext';

const { width } = Dimensions.get('window');
const QUARTER_WIDTH = width / 4;

export const StatsButton: React.FC = () => {
  const [showStats, setShowStats] = useState(false);
  const { calculateThrowStats } = useAppState();
  const { currentStep, showTutorial, deactivateButton } = useTutorial();
  const measureStats = useMeasureComponent(3); // Fourth tutorial step

  const handlePress = () => {
    deactivateButton();
    setShowStats(true);
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.button}
        onLayout={showTutorial && currentStep === 3 ? measureStats : undefined}
        onPress={handlePress}
      >
        <Text style={styles.buttonText}>Stats</Text>
      </TouchableOpacity>

      <ThrowStatsModal 
        visible={showStats}
        onClose={() => setShowStats(false)}
        stats={calculateThrowStats() || undefined}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20,
    right: 127,  // 20px corner + 89px Legend width + 10px gap + 8px margins
    width: 90,
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