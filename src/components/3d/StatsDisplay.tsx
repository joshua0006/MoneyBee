import React from 'react';
import { Html, Float } from '@react-three/drei';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Target, Zap } from 'lucide-react';
import { demoStats } from '@/utils/demoData';

interface StatsDisplayProps {
  position?: [number, number, number];
}

export function StatsDisplay({ position = [0, 4, 0] }: StatsDisplayProps) {
  const stats = [
    {
      icon: <TrendingUp className="w-5 h-5 text-primary" />,
      label: 'Total Tracked',
      value: `$${demoStats.totalExpenses.toLocaleString()}`,
      color: 'text-primary'
    },
    {
      icon: <Target className="w-5 h-5 text-blue-500" />,
      label: 'Budget Remaining',
      value: `$${(demoStats.monthlyBudget - demoStats.totalExpenses).toLocaleString()}`,
      color: 'text-blue-500'
    },
    {
      icon: <Clock className="w-5 h-5 text-green-500" />,
      label: 'Time Saved',
      value: demoStats.timesSaved,
      color: 'text-green-500'
    },
    {
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      label: 'AI Accuracy',
      value: demoStats.accuracyRate,
      color: 'text-yellow-500'
    }
  ];

  return (
    <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.2}>
      <group position={position}>
        <Html center>
          <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary mb-2">
                  Live Demo Stats
                </Badge>
                <h3 className="text-lg font-semibold">Your Financial Impact</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center space-y-2">
                    <div className="flex justify-center">
                      {stat.icon}
                    </div>
                    <div className={`text-xl font-bold ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Html>
      </group>
    </Float>
  );
}