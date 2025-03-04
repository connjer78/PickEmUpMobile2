# PickEmUp Mobile App Development Log

## Project Evolution
1. Started as Vite/React web app
   - Originally built as a web app but realized it needed to be native
   - App is meant for use while practicing disc golf
   - Must work in the field/course for marking throws
   - Requires reliable GPS and mobile functionality
2. Attempted port to React Native with Mapbox
3. Switched to react-native-maps due to Mapbox complexity
   - Mapbox caused many dependency issues
   - Complex native build requirements
   - Difficult to test with Expo Go
4. Starting fresh with clean React Native/Expo implementation
   - Simplified approach with react-native-maps
   - Focus on Expo Go for easier testing
   - Avoiding complex native dependencies

## Current Technical Decisions
- Using React Native (better for mobile than Vite/web)
- Using react-native-maps (simpler than Mapbox)
- Using Expo (easier development/testing)
- Using TypeScript (safer coding)
- Single screen app (no need for complex navigation)

## Core Features Needed
1. GPS Location tracking
2. Map display with satellite view
3. Target point selection
4. Throw marking and distance calculations
5. Pickup mode
6. Modals (Legend, Reset Confirm, etc.)

## Latest Implementation Steps
1. Created new project:
   npx create-expo-app PickEmUpMobile2 --template blank-typescript

2. Installed essential packages:
   npx expo install react-native-maps expo-location

3. Basic map implementation in App.tsx:
   import { StyleSheet, View } from 'react-native';
   import MapView from 'react-native-maps';

   export default function App() {
     return (
       <View style={styles.container}>
         <MapView 
           style={styles.map}
           initialRegion={{
             latitude: 37.78825,
             longitude: -122.4324,
             latitudeDelta: 0.0922,
             longitudeDelta: 0.0421,
           }}
         />
       </View>
     );
   }

   const styles = StyleSheet.create({
     container: {
       flex: 1,
     },
     map: {
       width: '100%',
       height: '100%',
     },
   });

## Next Steps
1. Implement location tracking
2. Add satellite view toggle
3. Implement target point selection
4. Add throw marking functionality
5. Calculate and display distances
6. Add pickup mode
7. Implement modals

## Reference
Original code available in PickEmUpMobile directory for feature reference.
Key files to port:
- MapComponent.tsx
- Controls.tsx
- distanceUtils.ts
- Modal components
