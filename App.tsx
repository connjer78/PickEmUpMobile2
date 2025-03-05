import { useEffect, useState, useMemo } from 'react';
import * as Location from 'expo-location';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
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
import { LoadingOverlay } from './components/LoadingOverlay';
import { TouchableOpacity, Text } from 'react-native';

const TOAST_PADDING = 20;

const MOCK_LOCATIONS = {
  ACCURATE: {
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 5,
    },
    timestamp: Date.now(),
  },
  POOR_ACCURACY: {
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 65,
    },
    timestamp: Date.now(),
  },
  NO_SIGNAL: null,
};

const useGPSSimulation = (
  onLocationUpdate: (coords: { latitude: number; longitude: number }) => void
) => {
  const [isWaitingForLocation, setIsWaitingForLocation] = useState(true);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Store the real location when we get it
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest
        });
        if (location?.coords) {
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        }
      } catch (error) {
        console.error('Error getting initial location for simulation:', error);
      }
    };
    getCurrentLocation();
  }, []);

  const simulateGPSCondition = async (condition: 'ACCURATE' | 'POOR_ACCURACY' | 'NO_SIGNAL') => {
    if (!__DEV__) return;
    
    if (condition === 'NO_SIGNAL') {
      setIsWaitingForLocation(true);
      setLocationAccuracy(null);
      return;
    }

    // Use current location or keep the last known location
    const baseLocation = currentLocation || {
      latitude: 0,
      longitude: 0
    };

    const mockLocation = {
      coords: {
        ...baseLocation,
        accuracy: condition === 'ACCURATE' ? 5 : 65,
      },
      timestamp: Date.now(),
    };

    onLocationUpdate({
      latitude: mockLocation.coords.latitude,
      longitude: mockLocation.coords.longitude,
    });
    setLocationAccuracy(mockLocation.coords.accuracy);
    setIsWaitingForLocation(false);
  };

  return {
    isWaitingForLocation,
    locationAccuracy,
    simulateGPSCondition,
    setIsWaitingForLocation,
    setLocationAccuracy
  };
};

const useLocationTracking = (shouldTrack: boolean, onLocationUpdate: (coords: { latitude: number; longitude: number }) => void) => {
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);
  const [isWaitingForLocation, setIsWaitingForLocation] = useState(true);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const startTracking = async () => {
      try {
        setIsWaitingForLocation(true);
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
          setLocationAccuracy(location.coords.accuracy);
          setIsWaitingForLocation(false);
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
                setLocationAccuracy(newLocation.coords.accuracy);
                setIsWaitingForLocation(false);
              }
            }
          );
          setSubscription(newSubscription);
        }
      } catch (error) {
        console.error('Error setting up location tracking:', error);
        setIsWaitingForLocation(false);
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

  return { isWaitingForLocation, locationAccuracy };
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
    return mode === 'initial' || mode === 'pickup';
  }, [mode]);

  const { isWaitingForLocation, locationAccuracy } = useLocationTracking(shouldTrackLocation, updateUserLocationAndRoute);
  
  const [uiHeights, setUiHeights] = useState({
    header: 0,
    controls: 0,
    distanceInfo: 0
  });
  
  const toastPosition = uiHeights.header + uiHeights.controls + uiHeights.distanceInfo;

  const getLoadingMessage = () => {
    if (!locationAccuracy) return 'Waiting for GPS signal...';
    if (locationAccuracy > 20) return `Improving GPS accuracy (${Math.round(locationAccuracy)}m)...`;
    return `GPS accuracy: ${Math.round(locationAccuracy)}m`;
  };
  
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
      <LoadingOverlay 
        isVisible={isWaitingForLocation}
        message={getLoadingMessage()}
      />
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
