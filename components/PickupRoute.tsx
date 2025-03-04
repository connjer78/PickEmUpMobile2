import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Polyline, Marker } from 'react-native-maps';
import { RoutePoint } from '../utils/pickupUtils';
import { calculateDistance } from '../utils/distanceUtils';

interface Props {
  route: RoutePoint[];
}

interface Dot {
  id: number;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  distance: number;
}

const ANIMATION_SPEED = 0.5; // meters per frame
const DOT_SPACING = 10; // meters between dots
const NUM_DOTS = 10;

export const PickupRoute: React.FC<Props> = ({ route }) => {
  const [dots, setDots] = useState<Dot[]>([]);
  const animationRef = useRef<number>();
  const pathLengthRef = useRef(0);
  
  // Calculate total path length and segment information on mount or route change
  useEffect(() => {
    let totalDistance = 0;
    const segments: { start: RoutePoint; end: RoutePoint; distance: number; cumDistance: number }[] = [];
    
    for (let i = 0; i < route.length - 1; i++) {
      const start = route[i];
      const end = route[i + 1];
      const segmentDistance = calculateDistance(
        start.latitude,
        start.longitude,
        end.latitude,
        end.longitude,
        false
      );
      segments.push({ 
        start, 
        end, 
        distance: segmentDistance,
        cumDistance: totalDistance 
      });
      totalDistance += segmentDistance;
    }
    
    pathLengthRef.current = totalDistance;
    
    // Initialize dots
    const initialDots: Dot[] = Array.from({ length: NUM_DOTS }, (_, i) => ({
      id: i,
      coordinate: { ...route[0] },
      distance: i * (totalDistance / NUM_DOTS)
    }));
    
    setDots(initialDots);
    
    // Function to get coordinate at a specific distance along the path
    const getCoordinateAtDistance = (distance: number) => {
      // Normalize distance to path length
      distance = distance % totalDistance;
      
      // Find the segment this distance falls on
      const segment = segments.find(seg => 
        distance >= seg.cumDistance && 
        distance < seg.cumDistance + seg.distance
      );
      
      if (!segment) {
        return route[route.length - 1];
      }
      
      // Calculate progress within this segment
      const segmentProgress = (distance - segment.cumDistance) / segment.distance;
      
      return {
        latitude: segment.start.latitude + (segment.end.latitude - segment.start.latitude) * segmentProgress,
        longitude: segment.start.longitude + (segment.end.longitude - segment.start.longitude) * segmentProgress
      };
    };
    
    // Animation function
    const animate = () => {
      setDots(prevDots => 
        prevDots.map(dot => {
          const newDistance = (dot.distance + ANIMATION_SPEED) % totalDistance;
          return {
            ...dot,
            coordinate: getCoordinateAtDistance(newDistance),
            distance: newDistance
          };
        })
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [route]);

  return (
    <>
      {/* Main route line */}
      <Polyline
        coordinates={route}
        strokeWidth={12}
        strokeColor="rgba(128, 0, 255, 0.7)"
      />

      {/* Dots */}
      {dots.map(dot => (
        <Marker
          key={dot.id}
          coordinate={dot.coordinate}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.dot} />
        </Marker>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
}); 