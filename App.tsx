import React from 'react';
import * as Location from 'expo-location';
import { StyleSheet, View, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { TutorialProvider, useTutorial } from './context/TutorialContext';
import { Map } from './components/Map';
import { Controls } from './components/Controls';
import { DistanceInfo } from './components/DistanceInfo';
import { Header } from './components/Header';
import { InstructionToast } from './components/InstructionToast';
import { StatsButton } from './components/StatsButton';
import { LegendButton } from './components/LegendButton';
import { TutorialButton } from './components/TutorialButton';
import { SplashScreen } from './components/SplashScreen';

const TOAST_PADDING = 56; // Additional padding for toast to avoid button overlap

const AppContent = () => {
  const [showSplash, setShowSplash] = React.useState(true);
  const [location, setLocation] = React.useState(null);
  const { 
    isActive, 
    startTutorial 
  } = useTutorial();
  
  const {
    instructionMessage,
    mode,
    updateUserLocationAndRoute
  } = useAppState();
  
  const [uiHeights, setUiHeights] = React.useState({
    header: 0,
    controls: 0,
    distanceInfo: 0
  });
  
  const toastPosition = uiHeights.header + uiHeights.controls;
  
  // Initialize and update location
  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      // Get initial location
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest
      });
      setLocation(location);
      
      if (location?.coords) {
        updateUserLocationAndRoute({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      }

      // Watch for location updates
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 1000,    // Update every second
          distanceInterval: 1,   // Update every meter
        },
        (newLocation) => {
          setLocation(newLocation);
          if (newLocation?.coords) {
            updateUserLocationAndRoute({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude
            });
          }
        }
      );

      // Cleanup subscription
      return () => {
        locationSubscription.remove();
      };
    })();
  }, [mode]); // Re-run when mode changes
  
  if (showSplash) {
    return (
      <SplashScreen 
        onComplete={() => {
          setShowSplash(false);
        }} 
      />
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.topContainer}>
        <View 
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setUiHeights(prev => ({ ...prev, header: height }));
          }}
        >
          <Header />
        </View>
        <View 
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setUiHeights(prev => ({ ...prev, controls: height }));
          }}
        >
          <Controls />
        </View>
        <View 
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setUiHeights(prev => ({ ...prev, distanceInfo: height }));
          }}
        >
          <DistanceInfo />
        </View>
        <InstructionToast 
          message={instructionMessage || ''} 
          visible={!!instructionMessage}
          topPosition={toastPosition + TOAST_PADDING}
        />
      </View>
      <View style={styles.mapContainer}>
        <Map />
        <StatsButton />
        <LegendButton />
      </View>
      <TutorialButton onPress={startTutorial} isActive={isActive} />
    </View>
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
  topContainer: {
    zIndex: 1,
  },
  mapContainer: {
    flex: 1,  // This will take up remaining space after topContainer
    position: 'relative',
  },
});
