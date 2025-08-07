import React, { useState, useEffect } from 'react';
import { Html, Float } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, X, Play, Pause } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  position: [number, number, number];
  targetFeature: string;
  action?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '👋 Welcome to MoneyBee!',
    description: 'Your AI-powered financial companion. Let\'s take a quick tour of the key features.',
    position: [0, 3, 2],
    targetFeature: 'intro'
  },
  {
    id: 'phone-demo',
    title: '📱 Interactive App Demo',
    description: 'Click on the phone to explore different screens and see how the app works in real-time.',
    position: [0, 0, 3],
    targetFeature: 'phone',
    action: 'Click the phone screen'
  },
  {
    id: 'scanning',
    title: '📸 Smart Receipt Scanning',
    description: 'Snap photos of receipts and let AI extract all expense details automatically.',
    position: [-3, 2, 2],
    targetFeature: 'scanning'
  },
  {
    id: 'ai-categorization',
    title: '🧠 AI Categorization',
    description: 'Machine learning automatically categorizes your expenses and suggests improvements.',
    position: [3, 1, 2],
    targetFeature: 'ai'
  },
  {
    id: 'budgets',
    title: '🎯 Smart Budgeting',
    description: 'Set intelligent spending limits and get real-time insights on your financial habits.',
    position: [-2, -1, 2],
    targetFeature: 'budgets'
  },
  {
    id: 'wealth-tracking',
    title: '📈 Wealth Growth',
    description: 'Simulate investment scenarios and track your net worth over time with detailed projections.',
    position: [3, -2, 2],
    targetFeature: 'wealth'
  },
  {
    id: 'charts',
    title: '📊 Visual Analytics',
    description: 'Beautiful 3D charts and insights help you understand your financial patterns.',
    position: [0, -3, 2],
    targetFeature: 'charts'
  },
  {
    id: 'get-started',
    title: '🚀 Ready to Begin?',
    description: 'Start your financial journey with MoneyBee today. Sign up for free and take control of your money!',
    position: [0, 3, 2],
    targetFeature: 'cta'
  }
];

interface GuidedTourProps {
  isActive: boolean;
  onClose: () => void;
  onGetStarted: () => void;
}

export function GuidedTour({ isActive, onClose, onGetStarted }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && isActive) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= tourSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isActive]);

  if (!isActive) return null;

  const currentTourStep = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleGetStarted = () => {
    onClose();
    onGetStarted();
  };

  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group position={currentTourStep.position}>
        <Html center>
          <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-2xl border-primary/20">
            <CardContent className="p-6">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    Step {currentStep + 1} of {tourSteps.length}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleTogglePlay}
                      className="h-6 w-6 p-0"
                    >
                      {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onClose}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Step Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {currentTourStep.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentTourStep.description}
                  </p>
                </div>

                {currentTourStep.action && (
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="text-xs font-medium text-primary">
                      💡 Try it: {currentTourStep.action}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  {currentStep === tourSteps.length - 1 ? (
                    <Button
                      onClick={handleGetStarted}
                      className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Quick Skip */}
                {currentStep < tourSteps.length - 1 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setCurrentStep(tourSteps.length - 1)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Skip to end
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Html>
      </group>
    </Float>
  );
}