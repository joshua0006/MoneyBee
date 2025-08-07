import React, { useState } from 'react';
import { Html, Float } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { demoFeatures } from '@/utils/demoData';

interface FeatureCalloutsProps {
  onFeatureClick: (featureId: string) => void;
  activeFeature: string | null;
}

function FeatureCallout({ 
  feature, 
  isActive, 
  onClick 
}: { 
  feature: typeof demoFeatures[0]; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group position={feature.position}>
        <Html center>
          <Card 
            className={`w-72 cursor-pointer transition-all duration-300 hover:scale-105 ${
              isActive 
                ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20' 
                : 'bg-card/90 backdrop-blur-sm border-border/50 hover:bg-card'
            }`}
            onClick={onClick}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="text-2xl">{feature.icon}</div>
                {isActive && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    Active
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
              
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary">{feature.benefit}</span>
              </div>
              
              <Button 
                size="sm" 
                variant={isActive ? "default" : "outline"}
                className="w-full flex items-center gap-2"
              >
                {feature.demoAction}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </Html>
      </group>
    </Float>
  );
}

export function FeatureCallouts({ onFeatureClick, activeFeature }: FeatureCalloutsProps) {
  return (
    <group>
      {demoFeatures.map((feature) => (
        <FeatureCallout
          key={feature.id}
          feature={feature}
          isActive={activeFeature === feature.id}
          onClick={() => onFeatureClick(feature.id)}
        />
      ))}
    </group>
  );
}