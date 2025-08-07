import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, RoundedBox, Text } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import * as THREE from 'three';

interface DemoState {
  screen: 'dashboard' | 'expenses' | 'budget' | 'simulation';
  expense?: {
    amount: number;
    category: string;
    description: string;
  };
}

interface InteractiveDemoProps {
  demoState: DemoState;
  onStateChange: (state: DemoState) => void;
}

const sampleExpenses = [
  { id: 1, amount: -45, description: "Coffee Shop", category: "Food", date: "Today", color: "#ef4444" },
  { id: 2, amount: -120, description: "Groceries", category: "Food", date: "Yesterday", color: "#ef4444" },
  { id: 3, amount: -25, description: "Gas Station", category: "Transport", date: "2 days ago", color: "#f97316" },
  { id: 4, amount: 1250, description: "Salary", category: "Income", date: "3 days ago", color: "#22c55e" },
  { id: 5, amount: -80, description: "Electric Bill", category: "Utilities", date: "1 week ago", color: "#8b5cf6" },
];

const budgetData = [
  { category: "Food", spent: 165, budget: 400, color: "#ef4444" },
  { category: "Transport", spent: 125, budget: 200, color: "#f97316" },
  { category: "Utilities", spent: 180, budget: 250, color: "#8b5cf6" },
  { category: "Entertainment", spent: 45, budget: 150, color: "#06b6d4" },
];

export function InteractiveDemo({ demoState, onStateChange }: InteractiveDemoProps) {
  const containerRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (containerRef.current) {
      // Subtle floating animation
      containerRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  const renderDashboard = () => (
    <div className="w-full h-full bg-gradient-to-br from-background to-primary/5 p-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs">
            🐝
          </div>
          <span className="font-bold text-sm">MoneyBee</span>
        </div>
        <Badge variant="secondary" className="text-xs">Live Demo</Badge>
      </div>

      {/* Net Worth Card */}
      <Card className="mb-3 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-3">
          <div className="text-xs text-muted-foreground">Total Net Worth</div>
          <div className="text-lg font-bold text-primary">$12,450</div>
          <div className="text-xs text-green-600 flex items-center gap-1">
            📈 +8.2% this month
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Card>
          <CardContent className="p-2">
            <div className="text-xs text-muted-foreground">This Month</div>
            <div className="text-sm font-semibold text-red-500">-$690</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2">
            <div className="text-xs text-muted-foreground">Budget Left</div>
            <div className="text-sm font-semibold text-green-500">$310</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Button 
          size="sm" 
          className="w-full text-xs" 
          onClick={() => onStateChange({ screen: 'expenses' })}
        >
          📱 View Expenses
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full text-xs"
          onClick={() => onStateChange({ screen: 'budget' })}
        >
          🎯 Check Budget
        </Button>
      </div>
    </div>
  );

  const renderExpenses = () => (
    <div className="w-full h-full bg-background p-3 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">Recent Expenses</h3>
        <Button 
          size="sm" 
          variant="ghost" 
          className="text-xs"
          onClick={() => onStateChange({ screen: 'dashboard' })}
        >
          ← Back
        </Button>
      </div>

      <div className="space-y-2">
        {sampleExpenses.slice(0, 6).map((expense) => (
          <Card key={expense.id} className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium">{expense.description}</div>
                <div className="text-xs text-muted-foreground">{expense.category}</div>
              </div>
              <div className="text-right">
                <div 
                  className="text-sm font-semibold"
                  style={{ color: expense.color }}
                >
                  {expense.amount > 0 ? '+' : ''}${Math.abs(expense.amount)}
                </div>
                <div className="text-xs text-muted-foreground">{expense.date}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderBudget = () => (
    <div className="w-full h-full bg-background p-3 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">Budget Overview</h3>
        <Button 
          size="sm" 
          variant="ghost" 
          className="text-xs"
          onClick={() => onStateChange({ screen: 'dashboard' })}
        >
          ← Back
        </Button>
      </div>

      <div className="space-y-3">
        {budgetData.map((item) => (
          <Card key={item.category} className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">{item.category}</span>
              <span className="text-xs">${item.spent}/${item.budget}</span>
            </div>
            <Progress 
              value={(item.spent / item.budget) * 100} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              ${item.budget - item.spent} remaining
            </div>
          </Card>
        ))}
      </div>

      <Button 
        size="sm" 
        className="w-full text-xs mt-3"
        onClick={() => onStateChange({ screen: 'simulation' })}
      >
        🚀 Financial Simulation
      </Button>
    </div>
  );

  const renderSimulation = () => (
    <div className="w-full h-full bg-background p-3 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">Wealth Projection</h3>
        <Button 
          size="sm" 
          variant="ghost" 
          className="text-xs"
          onClick={() => onStateChange({ screen: 'budget' })}
        >
          ← Back
        </Button>
      </div>

      <Card className="mb-3 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-3">
          <div className="text-xs text-muted-foreground">Projected Net Worth (5 years)</div>
          <div className="text-lg font-bold text-green-600">$45,230</div>
          <div className="text-xs text-green-600">With 7% annual growth</div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-8 rounded flex items-center justify-center text-white text-xs">
          📈 Investment Growth: $32,780
        </div>
        <div className="bg-gradient-to-r from-green-500 to-teal-500 h-6 rounded flex items-center justify-center text-white text-xs">
          💰 Savings: $12,450
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-4 rounded flex items-center justify-center text-white text-xs">
          🎯 Emergency Fund: $5,000
        </div>
      </div>

      <div className="mt-3 p-2 bg-amber-50 rounded border border-amber-200">
        <div className="text-xs text-amber-800">
          💡 <strong>Tip:</strong> Increase savings by $50/month to reach $50K in 4.5 years!
        </div>
      </div>
    </div>
  );

  const getCurrentScreen = () => {
    switch (demoState.screen) {
      case 'expenses':
        return renderExpenses();
      case 'budget':
        return renderBudget();
      case 'simulation':
        return renderSimulation();
      default:
        return renderDashboard();
    }
  };

  return (
    <group ref={containerRef}>
      {/* Phone Screen Content */}
      <Html
        transform
        occlude
        position={[0, 0, 0.07]}
        style={{
          width: '280px',
          height: '500px',
          borderRadius: '20px',
          overflow: 'hidden',
          userSelect: 'none'
        }}
      >
        {getCurrentScreen()}
      </Html>
    </group>
  );
}