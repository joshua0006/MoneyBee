import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coffee, ShoppingCart, Car, Utensils, Fuel, DollarSign, Target, Flame, Trophy } from 'lucide-react';
import type { MicrosavingsChallenge } from '@/types/app';

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

  useEffect(() => {
    // Load active challenges from localStorage
    const saved = localStorage.getItem('microsavings-challenges');
    if (saved) {
      const parsed = JSON.parse(saved);
      setActiveChallenges(parsed.active || []);
    }
  }, []);

  const saveToStorage = (active: MicrosavingsChallenge[]) => {
    localStorage.setItem('microsavings-challenges', JSON.stringify({
      active
    }));
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
    saveToStorage(updatedActive);
  };

  const quitChallenge = (challengeId: string) => {
    const newActive = activeChallenges.filter(c => c.id !== challengeId);
    setActiveChallenges(newActive);
    saveToStorage(newActive);
  };

  if (activeChallenges.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
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
    </div>
  );
}