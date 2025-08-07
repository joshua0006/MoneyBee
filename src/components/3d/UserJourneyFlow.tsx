import React, { useState, useEffect } from 'react';
import { Html, Float } from '@react-three/drei';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';
import { demoUserJourney } from '@/utils/demoData';

interface UserJourneyFlowProps {
  position?: [number, number, number];
  isActive: boolean;
}

export function UserJourneyFlow({ position = [0, -4, 2], isActive }: UserJourneyFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && isActive) {
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % demoUserJourney.length);
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isActive]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const currentJourneyStep = demoUserJourney[currentStep];

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.25}>
      <group position={position}>
        <Html center>
          <Card className="w-80 bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  User Journey
                </Badge>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePlayPause}
                    className="h-8 w-8 p-0"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReset}
                    className="h-8 w-8 p-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Progress indicators */}
              <div className="flex justify-center mb-6">
                {demoUserJourney.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full mx-1 transition-all duration-300 ${
                      index === currentStep 
                        ? 'bg-primary scale-125' 
                        : index < currentStep 
                          ? 'bg-primary/50' 
                          : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Current step */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full text-primary font-bold text-lg">
                  {currentJourneyStep.step}
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {currentJourneyStep.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {currentJourneyStep.description}
                  </p>
                </div>

                <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                  <div className="text-sm font-medium text-primary mb-1">
                    {currentJourneyStep.action}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    ⏱️ {currentJourneyStep.time}
                  </div>
                </div>

                {/* Manual navigation */}
                <div className="flex justify-between pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentStep((prev) => 
                      prev > 0 ? prev - 1 : demoUserJourney.length - 1
                    )}
                    disabled={isPlaying}
                  >
                    Previous
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => setCurrentStep((prev) => 
                      (prev + 1) % demoUserJourney.length
                    )}
                    disabled={isPlaying}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </Html>
      </group>
    </Float>
  );
}