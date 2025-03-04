import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useAppState } from '../context/AppStateContext';
import { useTutorial } from '../context/TutorialContext';
import { ThrowMarkerDot } from './ThrowMarkerDot';
import { TargetMarker } from './TargetMarker';
import { UserLocationMarker } from './UserLocationMarker';
import { RangeLines } from './RangeLines';
import { PickupRoute } from './PickupRoute';
import { ThrowFeedback } from './ThrowFeedback';
import { MarkerOptionsModal } from './MarkerOptionsModal';
import { ConfirmModal } from './ConfirmModal';
import { getMarkerColor } from '../utils/markerUtils';
import { calculateWeightedMidpoint, calculateDistance } from '../utils/distanceUtils';

const BASE_ALTITUDE = 300;
const ALTITUDE_THRESHOLD = 475;
const ALTITUDE_MULTIPLIER = 0.6;

export const Map = () => {
  const mapRef = useRef<MapView>(null);
  const { 
    mode, 
    throwData,
    selectedThrow,
    modals,
    pickupRoute,
    selectThrow,
    showMarkerOptionsModal,
    showPickupConfirmModal,
    setRangeTarget,
    setMode,
    addThrow,
    deleteSelectedThrow,
    clearSelectedThrow,
    throwFeedback,
    hideMarkerOptionsModal,
    showMoveConfirmModal,
    showDeleteConfirmModal,
    setInstructionMessage,
    hideMoveConfirmModal,
    hideDeleteConfirmModal,
    moveThrow,
    confirmThrowPickup,
    hidePickupConfirmModal,
  } = useAppState();

  const { showTutorial, currentStep } = useTutorial();

  const calculateMapAltitude = (distance: number): number => {
    if (distance <= ALTITUDE_THRESHOLD) {
      const scale = distance / ALTITUDE_THRESHOLD;
      return BASE_ALTITUDE * Math.max(0.5, scale);
    }
    return BASE_ALTITUDE + (distance * ALTITUDE_MULTIPLIER);
  };

  useEffect(() => {
    if (throwData.rangeTarget && throwData.userLocation && throwData.bearing !== null && mapRef.current) {
      const distance = calculateDistance(
        throwData.userLocation.latitude,
        throwData.userLocation.longitude,
        throwData.rangeTarget.latitude,
        throwData.rangeTarget.longitude,
        false
      );

      const centerPoint = calculateWeightedMidpoint(
        throwData.userLocation,
        throwData.rangeTarget,
        0.6
      );

      mapRef.current.animateCamera({
        center: centerPoint,
        heading: throwData.bearing || 0,
        pitch: 0,
        altitude: calculateMapAltitude(distance),
      }, { duration: 300 });
    }
  }, [throwData.rangeTarget, throwData.bearing]);

  const handleMapPress = async (event: any) => {
    if (modals.markerOptions || modals.deleteConfirm) {
      return;
    }

    const { coordinate } = event.nativeEvent;
    
    if (mode === 'settingTarget') {
      if (!throwData.userLocation) return;
      setRangeTarget(coordinate, throwData.userLocation);
      setTimeout(() => {
        setMode('throwMarking');
      }, 350);
    } else if (mode === 'markingThrow') {
      if (selectedThrow !== null) {
        moveThrow(coordinate);
        clearSelectedThrow();
        setMode('throwMarking');
      } else {
        addThrow(coordinate);
      }
      
      setInstructionMessage(null);
      setTimeout(() => {
        setMode('throwMarking');
      }, 50);
    }
  };

  return (
    <View style={styles.container}>
      <MapView 
        ref={mapRef}
        style={styles.map}
        mapType="satellite"
        showsUserLocation={mode === 'initial' || mode === 'settingTarget'}
        showsCompass={false}
        onPress={handleMapPress}
        initialRegion={{
          latitude: throwData.userLocation?.latitude || 0,
          longitude: throwData.userLocation?.longitude || 0,
          latitudeDelta: 0.0022,
          longitudeDelta: 0.0021,
        }}
      >
        {throwData.rangeTarget && (
          <Marker
            coordinate={throwData.rangeTarget}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <TargetMarker />
          </Marker>
        )}

        {throwData.userLocation && throwData.rangeTarget && (mode === 'pickup' || mode !== 'settingTarget') && (
          <Marker
            coordinate={throwData.userLocation}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <UserLocationMarker />
          </Marker>
        )}

        {(mode === 'throwMarking' || mode === 'markingThrow') && 
         throwData.rangeTarget && 
         throwData.userLocation && 
         throwData.bearing !== null && (
          <RangeLines 
            userLocation={throwData.userLocation}
            target={throwData.rangeTarget}
            bearing={throwData.bearing}
          />
        )}

        {throwData.throws.map((throw_) => {
          if (throw_.picked) return null;
          
          const isSelected = selectedThrow?.id === throw_.id;
          const markerColor = getMarkerColor(throw_.throwBearing, throw_.referenceBearing);
          
          return (
            <ThrowMarkerDot
              key={throw_.id}
              coordinate={throw_}
              isSelected={isSelected}
              markerColor={markerColor}
              mode={mode}
              onPress={() => {
                if (mode === 'markingThrow') return;
                
                if (mode === 'pickup') {
                  showPickupConfirmModal(throw_.id);
                  return;
                }
                
                selectThrow(throw_.id, throw_);
                showMarkerOptionsModal();
              }}
              index={throwData.throws.indexOf(throw_)}
            />
          );
        })}

        {mode === 'pickup' && pickupRoute && (
          <PickupRoute route={pickupRoute.points} />
        )}
      </MapView>
      <ThrowFeedback messages={throwFeedback} />
      <MarkerOptionsModal
        visible={modals.markerOptions}
        onClose={() => {
          hideMarkerOptionsModal();
          clearSelectedThrow();
        }}
        onMoveSelect={() => {
          hideMarkerOptionsModal();
          showMoveConfirmModal();
        }}
        onDeleteSelect={() => {
          hideMarkerOptionsModal();
          showDeleteConfirmModal();
        }}
      />
      <ConfirmModal
        visible={modals.moveConfirm}
        onConfirm={() => {
          hideMoveConfirmModal();
          setMode('markingThrow');
          setInstructionMessage('Tap the map where you want to move the marker.');
        }}
        onCancel={() => {
          hideMoveConfirmModal();
          clearSelectedThrow();
        }}
        message="Tap where you want to move the marker."
        confirmText="Move"
      />
      <ConfirmModal
        visible={modals.deleteConfirm}
        onConfirm={() => {
          deleteSelectedThrow();
          hideDeleteConfirmModal();
        }}
        onCancel={() => {
          hideDeleteConfirmModal();
          clearSelectedThrow();
        }}
        message="Are you sure you want to remove this marker?"
        confirmText="Remove"
        confirmButtonColor="#e74c3c"
      />
      <ConfirmModal
        visible={modals.pickupConfirm}
        onConfirm={() => {
          confirmThrowPickup();
        }}
        onCancel={() => {
          hidePickupConfirmModal();
          clearSelectedThrow();
        }}
        message="Confirm you've picked up this disc?"
        confirmText="Picked Up"
        confirmButtonColor="#27ae60"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
}); 