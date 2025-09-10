import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coffee, ShoppingCart, Car, Utensils, Fuel, DollarSign, Target, Flame, Trophy } from 'lucide-react';
import type { MicrosavingsChallenge } from '@/types/app';

const CHALLENGE_TEMPLATES: Omit<MicrosavingsChallenge, 'id' | 'isActive' | 'streak' | 'totalSaved'>[] = [
  {
    title: "Skip the Daily Latte",
    description: "Make coffee at home instead of buying your daily $5 coffee",
    dailySavings: 5,
    category: "Food & Drinks",
    icon: "Coffee",
    difficulty: "easy",
    duration: 30
  },
  {
    title: "Pack Your Lunch",
    description: "Bring lunch from home instead of ordering takeout",
    dailySavings: 12,
    category: "Food & Drinks", 
    icon: "Utensils",
    difficulty: "medium",
    duration: 21
  },
  {
    title: "Walk Instead of Ride",
    description: "Walk or bike for short trips instead of taking rideshare",
    dailySavings: 8,
    category: "Transportation",
    icon: "Car",
    difficulty: "easy",
    duration: 14
  },
  {
    title: "Skip One Impulse Buy",
    description: "Wait 24 hours before making unplanned purchases",
    dailySavings: 15,
    category: "Shopping",
    icon: "ShoppingCart",
    difficulty: "hard",
    duration: 30
  },
  {
    title: "Combine Errands",
    description: "Plan your trips to save on gas and time",
    dailySavings: 4,
    category: "Transportation",
    icon: "Fuel",
    difficulty: "easy",
    duration: 21
  }
];

const getIcon = (iconName: string) => {
  const icons = {
    Coffee,
    ShoppingCart, 
    Car,
    Utensils,
    Fuel,
    DollarSign
  };
  return icons[iconName as keyof typeof icons] || DollarSign;
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
    default: return 'bg-muted text-muted-foreground';
  }
};

interface MicroSavingsChallengeProps {
  onSavingsTrack?: (amount: number) => void;
}

export function MicroSavingsChallenge({ onSavingsTrack }: MicroSavingsChallengeProps) {
  const [activeChallenges, setActiveChallenges] = useState<MicrosavingsChallenge[]>([]);
  const [availableChallenges, setAvailableChallenges] = useState<MicrosavingsChallenge[]>([]);

  useEffect(() => {
    // Load challenges from localStorage or create new ones
    const saved = localStorage.getItem('microsavings-challenges');
    if (saved) {
      const parsed = JSON.parse(saved);
      setActiveChallenges(parsed.active || []);
      setAvailableChallenges(parsed.available || CHALLENGE_TEMPLATES.map((template, index) => ({
        ...template,
        id: `challenge_${index}`,
        isActive: false,
        streak: 0,
        totalSaved: 0
      })));
    } else {
      setAvailableChallenges(CHALLENGE_TEMPLATES.map((template, index) => ({
        ...template,
        id: `challenge_${index}`,
        isActive: false,
        streak: 0,
        totalSaved: 0
      })));
    }
  }, []);

  const saveToStorage = (active: MicrosavingsChallenge[], available: MicrosavingsChallenge[]) => {
    localStorage.setItem('microsavings-challenges', JSON.stringify({
      active,
      available
    }));
  };

  const startChallenge = (challenge: MicrosavingsChallenge) => {
    const activeChallenge = { ...challenge, isActive: true };
    const newActive = [...activeChallenges, activeChallenge];
    const newAvailable = availableChallenges.filter(c => c.id !== challenge.id);
    
    setActiveChallenges(newActive);
    setAvailableChallenges(newAvailable);
    saveToStorage(newActive, newAvailable);
  };

  const completeDaily = (challengeId: string) => {
    const updatedActive = activeChallenges.map(challenge => {
      if (challenge.id === challengeId) {
        const newStreak = challenge.streak + 1;
        const newTotal = challenge.totalSaved + challenge.dailySavings;
        onSavingsTrack?.(challenge.dailySavings);
        
        return {
          ...challenge,
          streak: newStreak,
          totalSaved: newTotal
        };
      }
      return challenge;
    });
    
    setActiveChallenges(updatedActive);
    saveToStorage(updatedActive, availableChallenges);
  };

  const quitChallenge = (challengeId: string) => {
    const challenge = activeChallenges.find(c => c.id === challengeId);
    if (challenge) {
      const resetChallenge = { ...challenge, isActive: false, streak: 0, totalSaved: 0 };
      const newActive = activeChallenges.filter(c => c.id !== challengeId);
      const newAvailable = [...availableChallenges, resetChallenge];
      
      setActiveChallenges(newActive);
      setAvailableChallenges(newAvailable);
      saveToStorage(newActive, newAvailable);
    }
  };

  if (activeChallenges.length === 0 && availableChallenges.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {activeChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Active Challenges
            </CardTitle>
            <CardDescription>
              Build financial discipline with small daily habits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeChallenges.map((challenge) => {
              const IconComponent = getIcon(challenge.icon);
              const progress = (challenge.streak / challenge.duration) * 100;
              
              return (
                <div key={challenge.id} className="p-4 bg-card border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{challenge.title}</h4>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                    </div>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        {challenge.streak} day streak
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        ${challenge.totalSaved} saved
                      </span>
                    </div>
                    
                    <Progress value={progress} className="h-2" />
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => completeDaily(challenge.id)}
                        className="flex-1"
                        size="sm"
                      >
                        Complete Today (+${challenge.dailySavings})
                      </Button>
                      <Button 
                        onClick={() => quitChallenge(challenge.id)}
                        variant="outline" 
                        size="sm"
                      >
                        Quit
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {availableChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Start a New Challenge</CardTitle>
            <CardDescription>
              Choose a habit to build and start saving today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {availableChallenges.slice(0, 3).map((challenge) => {
                const IconComponent = getIcon(challenge.icon);
                
                return (
                  <div key={challenge.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-background rounded">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{challenge.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Save ${challenge.dailySavings}/day • {challenge.duration} days
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => startChallenge(challenge)}
                      size="sm"
                      variant="outline"
                    >
                      Start
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}