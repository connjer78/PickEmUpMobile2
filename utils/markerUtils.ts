// Helper function to interpolate between two colors
const interpolateColor = (color1: string, color2: string, factor: number): string => {
  // Convert hex to RGB
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  // Get RGB components
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  // Interpolate each component
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const getMarkerColor = (throwBearing: number, referenceBearing: number): string => {
  const GREEN = '#2ecc71';
  const YELLOW = '#f1c40f';
  const RED = '#e74c3c';
  
  // Calculate absolute angle difference using the reference bearing from when the throw was made
  const angleDiff = Math.abs(throwBearing - referenceBearing);
  
  // If angle is less than 5 degrees, return green
  if (angleDiff <= 5) {
    return GREEN;
  }
  
  // If angle is more than 15 degrees, return red
  if (angleDiff >= 15) {
    return RED;
  }
  
  // For angles between 5 and 10 degrees, interpolate between green and yellow
  if (angleDiff <= 10) {
    const factor = (angleDiff - 5) / 5; // Will be between 0 and 1
    return interpolateColor(GREEN, YELLOW, factor);
  }
  
  // For angles between 10 and 15 degrees, interpolate between yellow and red
  const factor = (angleDiff - 10) / 5; // Will be between 0 and 1
  return interpolateColor(YELLOW, RED, factor);
}; 