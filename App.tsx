import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppStateProvider } from './context/AppStateContext';
import { TutorialProvider, useTutorial } from './context/TutorialContext';
import { Map } from './components/Map';
import { Controls } from './components/Controls';
import { DistanceInfo } from './components/DistanceInfo';
import { StatsButton } from './components/StatsButton';
import { LegendButton } from './components/LegendButton';
import { TutorialButton } from './components/TutorialButton';

const AppContent = () => {
  const { isActive, startTutorial } = useTutorial();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Map />
      <Controls />
      <DistanceInfo />
      <StatsButton />
      <LegendButton />
      <TutorialButton onPress={startTutorial} isActive={isActive} />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <TutorialProvider>
      <AppStateProvider>
        <AppContent />
      </AppStateProvider>
    </TutorialProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
