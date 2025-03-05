import React, { createContext, useContext, useState, useCallback } from 'react';

interface TutorialStep {
  message: string;
  targetArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  showTutorial: boolean;
  showMessage: boolean;
  startTutorial: () => void;
  endTutorial: () => void;
  nextStep: () => void;
  clearMessage: () => void;
  deactivateButton: () => void;
  deactivateFirstTime: () => void;
  tutorialSteps: TutorialStep[];
  updateTargetArea: (stepIndex: number, targetArea: TutorialStep['targetArea']) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const tutorialMessages = [
  "First, let's set a target.",
  "Great! Now you can mark your throws. Each throw will be color-coded based on accuracy.",
  "The Distance Info panel shows you important measurements for your throws.",
  "The Stats button shows you detailed statistics about your throwing session.",
  "The Legend explains what the different marker colors mean.",
  "When you're done, use Pickup Mode to collect your discs efficiently!"
];

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showMessage, setShowMessage] = useState(true);
  const [tutorialSteps, setTutorialSteps] = useState<TutorialStep[]>(
    tutorialMessages.map(message => ({
      message,
      targetArea: { x: 0, y: 0, width: 0, height: 0 },
    }))
  );

  const startTutorial = useCallback(() => {
    setShowTutorial(true);
    setIsActive(false);
    setShowMessage(true);
  }, []);

  const endTutorial = useCallback(() => {
    setShowTutorial(false);
    setCurrentStep(0);
    setShowMessage(true);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
    setShowMessage(true);
  }, []);

  const clearMessage = useCallback(() => {
    setShowMessage(false);
  }, []);

  const deactivateButton = useCallback(() => {
    setIsActive(false);
  }, []);

  const deactivateFirstTime = useCallback(() => {
    setIsActive(false);
  }, []);

  const updateTargetArea = useCallback((stepIndex: number, targetArea: TutorialStep['targetArea']) => {
    setTutorialSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, targetArea } : step
    ));
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        showTutorial,
        currentStep,
        showMessage,
        startTutorial,
        endTutorial,
        nextStep,
        clearMessage,
        deactivateButton,
        deactivateFirstTime,
        tutorialSteps,
        updateTargetArea,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}; 