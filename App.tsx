import { useEffect, useState, useMemo } from 'react';
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

const TOAST_PADDING = 20;

const useLocationTracking = (shouldTrack: boolean, onLocationUpdate: (coords: { latitude: number; longitude: number }) => void) => {
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let isMounted = true;

    const startTracking = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }

        // Get initial location
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest
        });
        
        if (isMounted && location?.coords) {
          onLocationUpdate({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        }

        if (shouldTrack && isMounted) {
          // Start watching location
          const newSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Highest,
              timeInterval: 1000,
              distanceInterval: 1,
            },
            (newLocation) => {
              if (newLocation?.coords) {
                onLocationUpdate({
                  latitude: newLocation.coords.latitude,
                  longitude: newLocation.coords.longitude
                });
              }
            }
          );
          setSubscription(newSubscription);
        }
      } catch (error) {
        console.error('Error setting up location tracking:', error);
      }
    };

    if (shouldTrack) {
      startTracking();
    } else if (subscription) {
      subscription.remove();
      setSubscription(null);
    }

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.remove();
      }
    };
  }, [shouldTrack, onLocationUpdate]);
};

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { 
    mode,
    updateUserLocationAndRoute,
    instructionMessage
  } = useAppState();
  
  const { 
    isActive, 
    startTutorial 
  } = useTutorial();

  const shouldTrackLocation = useMemo(() => {
    return mode === 'initial' || mode === 'settingTarget' || mode === 'pickup';
  }, [mode]);

  useLocationTracking(shouldTrackLocation, updateUserLocationAndRoute);
  
  const [uiHeights, setUiHeights] = useState({
    header: 0,
    controls: 0,
    distanceInfo: 0
  });
  
  const toastPosition = uiHeights.header + uiHeights.controls + uiHeights.distanceInfo;
  
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
