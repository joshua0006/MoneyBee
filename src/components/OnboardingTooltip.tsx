import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ArrowRight, Lightbulb } from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTooltipProps {
  steps: OnboardingStep[];
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTooltip = ({ 
  steps, 
  isVisible, 
  onComplete, 
  onSkip 
}: OnboardingTooltipProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShown(true);
      setCurrentStep(0);
    }
  }, [isVisible]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsShown(false);
    onComplete();
  };

  const handleSkipAll = () => {
    setIsShown(false);
    onSkip();
  };

  if (!isShown || !steps.length) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto animate-scale-in shadow-large">
        <CardHeader className="text-center pb-3">
          <div className="flex items-center justify-between">
            <div className="bg-primary/10 p-2 rounded-full">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkipAll}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-lg">{step.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.description}
          </p>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentStep 
                      ? 'bg-primary' 
                      : index < currentStep 
                        ? 'bg-primary/60' 
                        : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              {!isLastStep && (
                <Button variant="ghost" size="sm" onClick={handleSkipAll}>
                  Skip
                </Button>
              )}
              <Button onClick={handleNext} size="sm" className="bee-button">
                {isLastStep ? (
                  "Get Started"
                ) : (
                  <>
                    Next <ArrowRight className="w-3 h-3 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook for managing onboarding state
export const useOnboarding = (storageKey: string = 'hasSeenOnboarding') => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  const markAsComplete = () => {
    try {
      localStorage.setItem(storageKey, 'true');
      setHasSeenOnboarding(true);
    } catch {
      // Fail silently
    }
  };

  const resetOnboarding = () => {
    try {
      localStorage.removeItem(storageKey);
      setHasSeenOnboarding(false);
    } catch {
      // Fail silently
    }
  };

  return {
    hasSeenOnboarding,
    markAsComplete,
    resetOnboarding,
    shouldShowOnboarding: !hasSeenOnboarding
  };
};