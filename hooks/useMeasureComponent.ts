import { useCallback } from 'react';
import { useTutorial } from '../context/TutorialContext';

interface MeasureResult {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const useMeasureComponent = (stepIndex: number) => {
  const { updateTargetArea } = useTutorial();

  const measureComponent = useCallback((event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    
    // Update the target area in the tutorial context
    updateTargetArea(stepIndex, {
      x,
      y,
      width,
      height
    });
  }, [stepIndex, updateTargetArea]);

  return measureComponent;
}; 