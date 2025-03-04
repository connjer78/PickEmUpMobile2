import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { calculateDistance, calculateBearing } from '../utils/distanceUtils';
import { calculatePickupRoute, PickupRoute } from '../utils/pickupUtils';
import { useTutorial } from './TutorialContext';

// Types
export type AppMode = 'initial' | 'settingTarget' | 'throwMarking' | 'markingThrow' | 'pickup';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Throw extends Coordinates {
  id: string;
  picked: boolean;
  throwBearing: number;
  referenceBearing: number;  // Store the target bearing at time of throw
}

export interface ThrowData {
  range: number | null;
  lastThrow: number | null;
  offCenter: number | null;
  throws: Throw[];
  rangeTarget: Coordinates | null;
  userLocation: Coordinates | null;
  bearing: number | null;
}

export interface ButtonStates {
  setTargetActive: boolean;
  markThrowActive: boolean;
  resetThrowsActive: boolean;
  pickupModeActive: boolean;
  isSettingTarget: boolean;
}

interface SelectedThrow {
  id: string;
  coordinate: Coordinates;
}

interface AppState {
  mode: AppMode;
  throwData: ThrowData;
  buttonStates: ButtonStates;
  instructionMessage: string | null;
  isMetric: boolean;
  isResetModalVisible: boolean;
  selectedThrow: SelectedThrow | null;
  modals: {
    markerOptions: boolean;
    moveConfirm: boolean;
    deleteConfirm: boolean;
    pickupMode: boolean;
    pickupConfirm: boolean;
    pickupComplete: boolean;
    exitPickupMode: boolean;
  };
  pickupModeStage: 'confirmation' | 'stats' | null;
  throwFeedback: string[];
  pickupRoute: PickupRoute | null;
}

interface AppStateContextType extends AppState {
  setMode: (mode: AppMode) => void;
  setThrowData: (data: Partial<ThrowData>) => void;
  setInstructionMessage: (message: string | null) => void;
  toggleMetric: () => void;
  resetThrows: () => void;
  setRangeTarget: (target: Coordinates, currentLocation?: { latitude: number; longitude: number }) => void;
  addThrow: (throwCoords: Coordinates) => void;
  showResetModal: () => void;
  hideResetModal: () => void;
  selectThrow: (id: string, coordinate: Coordinates) => void;
  clearSelectedThrow: () => void;
  showMarkerOptionsModal: () => void;
  hideMarkerOptionsModal: () => void;
  showMoveConfirmModal: () => void;
  hideMoveConfirmModal: () => void;
  showDeleteConfirmModal: () => void;
  hideDeleteConfirmModal: () => void;
  moveThrow: (newCoordinate: Coordinates) => void;
  deleteSelectedThrow: () => void;
  setThrowFeedback: (messages: string[]) => void;
  showPickupModeModal: () => void;
  hidePickupModeModal: () => void;
  confirmPickupMode: () => void;
  startPickupMode: () => void;
  calculateThrowStats: () => { numberOfThrows: number; averageDistance: number; averageDegreesOffline: number; longestThrow: number } | null;
  showPickupConfirmModal: (throwId: string) => void;
  hidePickupConfirmModal: () => void;
  confirmThrowPickup: () => void;
  showExitPickupModeModal: () => void;
  hideExitPickupModeModal: () => void;
  exitPickupMode: () => void;
  hidePickupCompleteModal: () => void;
  updateUserLocationAndRoute: (userLocation: Coordinates) => void;
}

const initialState: AppState = {
  mode: 'initial',
  throwData: {
    range: null,
    lastThrow: null,
    offCenter: null,
    throws: [],
    rangeTarget: null,
    userLocation: null,
    bearing: null,
  },
  buttonStates: {
    setTargetActive: true,
    markThrowActive: false,
    resetThrowsActive: false,
    pickupModeActive: false,
    isSettingTarget: true,
  },
  instructionMessage: null,
  isMetric: false,
  isResetModalVisible: false,
  selectedThrow: null,
  modals: {
    markerOptions: false,
    moveConfirm: false,
    deleteConfirm: false,
    pickupMode: false,
    pickupConfirm: false,
    pickupComplete: false,
    exitPickupMode: false,
  },
  pickupModeStage: null,
  throwFeedback: [],
  pickupRoute: null,
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Add near the top with other constants
const LOCATION_UPDATE_THRESHOLD = 1; // meters
const DEBOUNCE_DELAY = 500; // milliseconds

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);
  const [feedbackQueue, setFeedbackQueue] = useState<string[][]>([]);
  const { showTutorial, currentStep, nextStep } = useTutorial();

  const locationUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<Coordinates | null>(null);

  useEffect(() => {
    if (feedbackQueue.length > 0) {
      const currentMessages = feedbackQueue[0];
      setThrowFeedback(currentMessages);
      
      const timer = setTimeout(() => {
        setFeedbackQueue(prev => {
          const [_, ...rest] = prev;
          return rest;
        });
        setThrowFeedback([]);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [feedbackQueue]);

  const setMode = (mode: AppMode) => {
    setState(prev => ({
      ...prev,
      mode,
      // When entering settingTarget mode, only clear the lines by nulling the bearing
      throwData: mode === 'settingTarget' ? {
        ...prev.throwData,
        bearing: null,
      } : prev.throwData,
      buttonStates: {
        ...prev.buttonStates,
        markThrowActive: mode === 'throwMarking',
        setTargetActive: true,
        isSettingTarget: mode === 'initial',
        resetThrowsActive: prev.throwData.throws.length > 0,
        pickupModeActive: prev.throwData.throws.length > 0,
      }
    }));
  };

  const setThrowData = (data: Partial<ThrowData>) => {
    setState(prev => ({
      ...prev,
      throwData: { ...prev.throwData, ...data }
    }));
  };

  const setInstructionMessage = (message: string | null) => {
    setState(prev => ({ ...prev, instructionMessage: message }));
  };

  const toggleMetric = () => {
    setState(prev => {
      // Get current throwData
      const { range, lastThrow, offCenter, rangeTarget, userLocation } = prev.throwData;
      
      // Only recalculate if we have the necessary coordinates
      const newRange = (range !== null && rangeTarget && userLocation) 
        ? calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            rangeTarget.latitude,
            rangeTarget.longitude,
            !prev.isMetric  // Use new metric setting
          )
        : range;

      // Convert lastThrow and offCenter if they exist
      const newLastThrow = lastThrow !== null 
        ? convertDistance(lastThrow, prev.isMetric, !prev.isMetric)
        : lastThrow;
        
      const newOffCenter = offCenter !== null
        ? convertDistance(offCenter, prev.isMetric, !prev.isMetric)
        : offCenter;

      return {
        ...prev,
        isMetric: !prev.isMetric,
        throwData: {
          ...prev.throwData,
          range: newRange,
          lastThrow: newLastThrow,
          offCenter: newOffCenter
        }
      };
    });
  };

  const resetThrows = () => {
    setState(prev => ({
      ...prev,
      throwData: {
        ...prev.throwData,
        throws: [],
        lastThrow: null,
        offCenter: null,
      },
      buttonStates: {
        ...prev.buttonStates,
        resetThrowsActive: false,
        pickupModeActive: false,
      }
    }));
  };

  const setRangeTarget = (target: Coordinates, currentLocation?: { latitude: number; longitude: number }) => {
    setState(prev => {
      // Always use the current GPS location when setting a new target
      if (!currentLocation) return prev; // Require current location

      const userLocation = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      };

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        target.latitude,
        target.longitude,
        prev.isMetric
      );

      const bearing = calculateBearing(
        userLocation.latitude,
        userLocation.longitude,
        target.latitude,
        target.longitude
      );

      // If we're in tutorial mode and on step 0, advance to the next step
      // since we've now actually set a target
      if (showTutorial && currentStep === 0) {
        setTimeout(() => nextStep(), 500); // Wait for map animation to complete
      }

      return {
        ...prev,
        throwData: {
          ...prev.throwData,
          rangeTarget: target,
          userLocation: userLocation,  // Always update to current GPS location
          range: distance,
          bearing: bearing,
          // Clear any existing throws when setting a new target
          throws: [],
          lastThrow: null,
          offCenter: null,
        },
        mode: 'throwMarking',
        buttonStates: {
          ...prev.buttonStates,
          isSettingTarget: false,
          markThrowActive: true,
          resetThrowsActive: false,
          pickupModeActive: false,
        },
        instructionMessage: null
      };
    });
  };

  const getThrowFeedbackMessages = (
    throwDistance: number,
    targetDistance: number,
    throwBearing: number,
    referenceBearing: number,
    throwCoords: Coordinates,
    targetCoords: Coordinates,
    isMetric: boolean
  ): string[] => {
    // Calculate distance to target itself
    const distanceToTarget = calculateDistance(
      throwCoords.latitude,
      throwCoords.longitude,
      targetCoords.latitude,
      targetCoords.longitude,
      false  // Always use feet for this calculation
    );

    // Calculate bearing difference (absolute)
    const bearingDiff = Math.abs(throwBearing - referenceBearing);
    
    // Log all the values we're checking
    console.log('Throw Feedback Calculations:', {
      distanceToTarget,
      throwDistance,
      targetDistance,
      bearingDiff,
      percentageOfTarget: (throwDistance / targetDistance) * 100
    });
    
    const messages: string[] = [];
    
    // Check all conditions and collect applicable messages
    if (distanceToTarget <= 20) {
      console.log('Bullseye condition met!');
      messages.push("Bullseye!");
    }
    
    if (throwDistance >= targetDistance * 1.1) {
      console.log('Juiced it condition met!');
      messages.push("Juiced it!");
    }
    
    if (bearingDiff > 25) {
      console.log('Ooof condition met!');
      messages.push("Ooof!");
    } else if (bearingDiff <= 5) {  // Only show "Good line" if not "Ooof"
      console.log('Good line condition met!');
      messages.push("Good line!");
    }
    
    if (messages.length === 0) {
      console.log('No feedback conditions met');
    }
    
    return messages;
  };

  const addThrow = (throwCoords: Coordinates) => {
    setState(prev => {
      if (!prev.throwData.rangeTarget || !prev.throwData.userLocation) return prev;

      const throwDistance = calculateDistance(
        prev.throwData.userLocation.latitude,
        prev.throwData.userLocation.longitude,
        throwCoords.latitude,
        throwCoords.longitude,
        prev.isMetric
      );

      const throwBearing = calculateBearing(
        prev.throwData.userLocation.latitude,
        prev.throwData.userLocation.longitude,
        throwCoords.latitude,
        throwCoords.longitude
      );

      const targetDistance = calculateDistance(
        prev.throwData.userLocation.latitude,
        prev.throwData.userLocation.longitude,
        prev.throwData.rangeTarget.latitude,
        prev.throwData.rangeTarget.longitude,
        prev.isMetric
      );

      const newThrow = { 
        ...throwCoords, 
        id: Date.now().toString(),
        picked: false,
        throwBearing: throwBearing,
        referenceBearing: prev.throwData.bearing!
      };

      // Get feedback messages
      const feedbackMessages = getThrowFeedbackMessages(
        throwDistance,
        targetDistance,
        throwBearing,
        prev.throwData.bearing!,
        throwCoords,
        prev.throwData.rangeTarget,
        prev.isMetric
      );

      // Add messages to queue if there are any
      if (feedbackMessages.length > 0) {
        setFeedbackQueue(queue => [...queue, feedbackMessages]);
      }

      // If we're in tutorial mode and on step 1, advance to the next step
      // since we've now actually marked a throw
      if (showTutorial && currentStep === 1) {
        nextStep();  // Advance immediately without waiting
      }

      return {
        ...prev,
        throwData: {
          ...prev.throwData,
          throws: [...prev.throwData.throws, newThrow],
          lastThrow: throwDistance,
        },
        buttonStates: {
          ...prev.buttonStates,
          resetThrowsActive: true,
          pickupModeActive: true,
        }
      };
    });
  };

  const showResetModal = () => {
    setState(prev => ({
      ...prev,
      isResetModalVisible: true,
      buttonStates: {
        ...prev.buttonStates,
        setTargetActive: false,
        markThrowActive: false,
        resetThrowsActive: false,
        pickupModeActive: false,
      }
    }));
  };

  const hideResetModal = () => {
    setState(prev => ({
      ...prev,
      isResetModalVisible: false,
      buttonStates: {
        ...prev.buttonStates,
        setTargetActive: true,
        markThrowActive: prev.mode === 'throwMarking',
        resetThrowsActive: prev.throwData.throws.length > 0,
        pickupModeActive: prev.throwData.throws.length > 0,
      }
    }));
  };

  const selectThrow = (id: string, coordinate: Coordinates) => {
    setState(prev => ({
      ...prev,
      selectedThrow: { id, coordinate },
    }));
  };

  const clearSelectedThrow = () => {
    setState(prev => ({
      ...prev,
      selectedThrow: null,
    }));
  };

  const showMarkerOptionsModal = () => {
    setState(prev => ({
      ...prev,
      modals: {
        ...prev.modals,
        markerOptions: true,
      },
    }));
  };

  const hideMarkerOptionsModal = () => {
    setState(prev => ({
      ...prev,
      modals: {
        ...prev.modals,
        markerOptions: false,
      },
    }));
  };

  const showMoveConfirmModal = () => {
    setState(prev => ({
      ...prev,
      modals: {
        ...prev.modals,
        moveConfirm: true,
      },
    }));
  };

  const hideMoveConfirmModal = () => {
    setState(prev => ({
      ...prev,
      modals: {
        ...prev.modals,
        moveConfirm: false,
      },
    }));
  };

  const showDeleteConfirmModal = () => {
    setState(prev => ({
      ...prev,
      modals: {
        ...prev.modals,
        deleteConfirm: true,
      },
    }));
  };

  const hideDeleteConfirmModal = () => {
    setState(prev => ({
      ...prev,
      modals: {
        ...prev.modals,
        deleteConfirm: false,
      },
    }));
  };

  const moveThrow = (newCoordinate: Coordinates) => {
    setState(prev => ({
      ...prev,
      throwData: {
        ...prev.throwData,
        throws: prev.throwData.throws.map(throw_ =>
          throw_.id === prev.selectedThrow?.id 
            ? { ...throw_, ...newCoordinate }
            : throw_
        ),
      },
      selectedThrow: null,
    }));
  };

  const deleteSelectedThrow = () => {
    setState(prev => ({
      ...prev,
      throwData: {
        ...prev.throwData,
        throws: prev.throwData.throws.filter(throw_ => throw_.id !== prev.selectedThrow?.id),
      },
      selectedThrow: null,
    }));
  };

  const setThrowFeedback = (messages: string[]) => {
    setState(prev => ({
      ...prev,
      throwFeedback: messages
    }));
  };

  const calculateThrowStats = () => {
    const throws = state.throwData.throws;
    if (!throws.length || !state.throwData.rangeTarget || !state.throwData.userLocation) return null;

    const numberOfThrows = throws.length;
    
    // Calculate distances for all throws
    const throwDistances = throws.map(throw_ => 
      calculateDistance(
        state.throwData.userLocation!.latitude,
        state.throwData.userLocation!.longitude,
        throw_.latitude,
        throw_.longitude,
        false // Always use feet for stats
      )
    );
    
    // Calculate longest throw
    const longestThrow = Math.max(...throwDistances);
    
    // Calculate average distance
    const totalDistance = throwDistances.reduce((sum, distance) => sum + distance, 0);
    
    // Calculate average degrees offline
    const totalDegreesOffline = throws.reduce((sum, throw_) => {
      return sum + Math.abs(throw_.throwBearing - throw_.referenceBearing);
    }, 0);

    return {
      numberOfThrows,
      averageDistance: totalDistance / numberOfThrows,
      averageDegreesOffline: totalDegreesOffline / numberOfThrows,
      longestThrow,
    };
  };

  const showPickupModeModal = () => {
    setState(prev => ({
      ...prev,
      modals: {
        ...prev.modals,
        pickupMode: true,
      },
      pickupModeStage: 'confirmation',
    }));
  };

  const hidePickupModeModal = () => {
    setState(prev => ({
      ...prev,
      modals: {
        ...prev.modals,
        pickupMode: false,
      },
      pickupModeStage: null,
    }));
  };

  const confirmPickupMode = () => {
    setState(prev => ({
      ...prev,
      pickupModeStage: 'stats',
    }));
  };

  const startPickupMode = () => {
    if (!state.throwData.userLocation) return;

    console.log('Starting pickup mode with user location:', state.throwData.userLocation);

    const initialRoute = calculatePickupRoute(
      state.throwData.userLocation,
      state.throwData.throws,
      []
    );

    console.log('Initial pickup route calculated:', {
      numPoints: initialRoute.points.length,
      numRemainingThrows: initialRoute.remainingThrows.length
    });

    setState(prev => ({
      ...prev,
      mode: 'pickup',
      modals: {
        ...prev.modals,
        pickupMode: false,
      },
      pickupModeStage: null,
      pickupRoute: initialRoute,
      instructionMessage: 'Tap a throw marker when you pick it up.'
    }));
  };

  const showPickupConfirmModal = (throwId: string) => {
    console.log('Showing pickup confirm modal for throw:', throwId);
    setState(prev => ({
      ...prev,
      selectedThrow: {
        id: throwId,
        coordinate: prev.throwData.throws.find(t => t.id === throwId)!
      },
      modals: {
        ...prev.modals,
        pickupConfirm: true
      }
    }));
  };

  const hidePickupConfirmModal = () => {
    console.log('Hiding pickup confirm modal');
    setState(prev => ({
      ...prev,
      selectedThrow: null,
      modals: {
        ...prev.modals,
        pickupConfirm: false
      }
    }));
  };

  const confirmThrowPickup = () => {
    if (!state.selectedThrow || !state.throwData.userLocation || !state.pickupRoute) {
      console.log('Cannot confirm throw pickup - missing required data:', {
        hasSelectedThrow: !!state.selectedThrow,
        hasUserLocation: !!state.throwData.userLocation,
        hasPickupRoute: !!state.pickupRoute
      });
      return;
    }

    const selectedThrow = state.selectedThrow;
    console.log('Confirming throw pickup:', {
      throwId: selectedThrow.id,
      numThrows: state.throwData.throws.length
    });

    // Remove the picked up throw from the array
    const updatedThrows = state.throwData.throws.filter(t => t.id !== selectedThrow.id);

    // Update the pickup route with remaining throws
    const newRoute = calculatePickupRoute(
      state.throwData.userLocation,
      updatedThrows,
      []  // No need to track picked throws anymore since we're removing them
    );

    // Check if all throws are picked up
    const allPickedUp = updatedThrows.length === 0;

    console.log('Updated pickup state:', {
      remainingThrows: updatedThrows.length,
      allPickedUp,
      newRoutePoints: newRoute.points.length
    });

    setState(prev => ({
      ...prev,
      throwData: {
        ...prev.throwData,
        throws: updatedThrows
      },
      pickupRoute: newRoute,
      modals: {
        ...prev.modals,
        pickupConfirm: false,
        pickupComplete: allPickedUp,
      },
      selectedThrow: null,
      mode: allPickedUp ? 'throwMarking' : 'pickup',
      instructionMessage: allPickedUp ? 'All throws collected!' : prev.instructionMessage
    }));
  };

  const showExitPickupModeModal = () => {
    setState(prev => ({
      ...prev,
      modals: {
        ...prev.modals,
        exitPickupMode: true,
      },
    }));
  };

  const hideExitPickupModeModal = () => {
    setState(prev => ({
      ...prev,
      modals: {
        ...prev.modals,
        exitPickupMode: false,
      },
    }));
  };

  const exitPickupMode = () => {
    setState(prev => ({
      ...prev,
      mode: 'throwMarking',
      modals: {
        ...prev.modals,
        exitPickupMode: false,
      },
      pickupRoute: null,
      instructionMessage: null
    }));
  };

  const hidePickupCompleteModal = () => {
    setState(prev => ({
      ...prev,
      modals: {
        ...prev.modals,
        pickupComplete: false,
      },
      mode: 'throwMarking',
      pickupRoute: null,
      instructionMessage: null
    }));
  };

  const updateUserLocationAndRoute = useCallback((userLocation: Coordinates) => {
    // Clear any pending timeout
    if (locationUpdateTimeoutRef.current) {
      clearTimeout(locationUpdateTimeoutRef.current);
    }

    // Debounce the update
    locationUpdateTimeoutRef.current = setTimeout(() => {
      // Check if location has changed significantly
      if (lastLocationRef.current) {
        const distance = calculateDistance(
          lastLocationRef.current.latitude,
          lastLocationRef.current.longitude,
          userLocation.latitude,
          userLocation.longitude,
          false
        );

        // Skip update if movement is below threshold
        if (distance < LOCATION_UPDATE_THRESHOLD) {
          return;
        }
      }

      // Update last location
      lastLocationRef.current = userLocation;

      setState(prev => {
        if (prev.mode === 'pickup' && prev.throwData.throws.length > 0) {
          const newRoute = calculatePickupRoute(
            userLocation,
            prev.throwData.throws,
            []
          );
          return {
            ...prev,
            throwData: {
              ...prev.throwData,
              userLocation
            },
            pickupRoute: newRoute
          };
        }
        return {
          ...prev,
          throwData: {
            ...prev.throwData,
            userLocation
          }
        };
      });
    }, DEBOUNCE_DELAY);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (locationUpdateTimeoutRef.current) {
        clearTimeout(locationUpdateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AppStateContext.Provider value={{
      ...state,
      setMode,
      setThrowData,
      setInstructionMessage,
      toggleMetric,
      resetThrows,
      setRangeTarget,
      addThrow,
      showResetModal,
      hideResetModal,
      selectThrow,
      clearSelectedThrow,
      showMarkerOptionsModal,
      hideMarkerOptionsModal,
      showMoveConfirmModal,
      hideMoveConfirmModal,
      showDeleteConfirmModal,
      hideDeleteConfirmModal,
      moveThrow,
      deleteSelectedThrow,
      setThrowFeedback,
      showPickupModeModal,
      hidePickupModeModal,
      confirmPickupMode,
      startPickupMode,
      calculateThrowStats,
      showPickupConfirmModal,
      hidePickupConfirmModal,
      confirmThrowPickup,
      hidePickupCompleteModal,
      showExitPickupModeModal,
      hideExitPickupModeModal,
      exitPickupMode,
      updateUserLocationAndRoute,
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

// Add near the top with other utility functions
const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Add this helper function at the top with other utilities
const convertDistance = (distance: number, fromMetric: boolean, toMetric: boolean): number => {
  if (fromMetric === toMetric) return distance;
  return fromMetric 
    ? Math.round(distance * 3.28084) // meters to feet
    : Math.round(distance / 3.28084); // feet to meters
}; 