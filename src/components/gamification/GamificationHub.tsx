import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

import { 
  Trophy, 
  Target, 
  Flame, 
  Star, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Zap,
  Award
} from 'lucide-react';
import type { Expense } from '@/types/app';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  progress: number;
  maxProgress: number;
  reward: number;
  deadline: Date;
  active: boolean;
}

interface GamificationHubProps {
  expenses: Expense[];
}

export const GamificationHub: React.FC<GamificationHubProps> = ({ expenses }) => {
  const [honeyCurrency, setHoneyCurrency] = useState(250);
  const [currentStreak, setCurrentStreak] = useState(12);
  const [level, setLevel] = useState(5);
  const [xp, setXp] = useState(340);
  const [xpToNext, setXpToNext] = useState(500);
  
  // Calculate financial metrics
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const totalSavings = totalIncome - totalExpenses;
  const budgetAdherence = 85; // This would be calculated based on actual budget data

  // Sample achievements
  const achievements: Achievement[] = [
    {
      id: 'first-expense',
      title: 'Getting Started',
      description: 'Add your first expense',
      icon: '🐝',
      unlocked: expenses.length > 0,
      progress: Math.min(expenses.length, 1),
      maxProgress: 1,
      reward: 10,
      rarity: 'common'
    },
    {
      id: 'expense-tracker',
      title: 'Busy Bee',
      description: 'Track 50 expenses',
      icon: '📝',
      unlocked: expenses.length >= 50,
      progress: Math.min(expenses.length, 50),
      maxProgress: 50,
      reward: 50,
      rarity: 'rare'
    },
    {
      id: 'savings-master',
      title: 'Honey Hoarder',
      description: 'Save $1000',
      icon: '💰',
      unlocked: totalSavings >= 1000,
      progress: Math.min(totalSavings, 1000),
      maxProgress: 1000,
      reward: 100,
      rarity: 'epic'
    },
    {
      id: 'streak-legend',
      title: 'Dedication Queen',
      description: 'Maintain a 30-day streak',
      icon: '🔥',
      unlocked: currentStreak >= 30,
      progress: Math.min(currentStreak, 30),
      maxProgress: 30,
      reward: 150,
      rarity: 'legendary'
    }
  ];

  // Sample challenges
  const challenges: Challenge[] = [
    {
      id: 'daily-track',
      title: 'Daily Tracker',
      description: 'Add at least one expense today',
      type: 'daily',
      progress: 1,
      maxProgress: 1,
      reward: 5,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      active: true
    },
    {
      id: 'weekly-budget',
      title: 'Budget Master',
      description: 'Stay under budget this week',
      type: 'weekly',
      progress: 4,
      maxProgress: 7,
      reward: 25,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      active: true
    },
    {
      id: 'monthly-saver',
      title: 'Savings Goal',
      description: 'Save $200 this month',
      type: 'monthly',
      progress: 120,
      maxProgress: 200,
      reward: 75,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      active: true
    }
  ];

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: Challenge['type']) => {
    switch (type) {
      case 'daily': return 'bg-green-100 text-green-800';
      case 'weekly': return 'bg-blue-100 text-blue-800';
      case 'monthly': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Player Stats Header */}
      <Card className="bg-gradient-to-r from-bee-gold/10 to-bee-blue/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-bee-gold to-bee-blue rounded-full flex items-center justify-center text-2xl">
                👑
              </div>
              <div>
                <h2 className="text-xl font-bold">Level {level} Bee Keeper</h2>
                <p className="text-muted-foreground">Keep buzzing to level up!</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-lg font-bold">
                <span>🍯</span>
                <span>{honeyCurrency}</span>
              </div>
              <p className="text-sm text-muted-foreground">Honey Currency</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Progress to Level {level + 1}</span>
              <span>{xp}/{xpToNext} XP</span>
            </div>
            <Progress value={(xp / xpToNext) * 100} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-orange-600">
                <Flame size={20} />
                <span>{currentStreak}</span>
              </div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-green-600">
                <DollarSign size={20} />
                <span>${Math.abs(totalSavings).toFixed(0)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total Saved</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-blue-600">
                <Target size={20} />
                <span>{budgetAdherence}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Budget Goal</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Gamification Tabs */}
      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy size={16} />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target size={16} />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Star size={16} />
            Rewards
          </TabsTrigger>
        </TabsList>


        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.unlocked ? 'border-primary/50' : 'border-muted'}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{achievement.title}</h4>
                          <Badge className={getRarityColor(achievement.rarity)} variant="secondary">
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <span>🍯</span>
                        <span>{achievement.reward}</span>
                      </div>
                      {achievement.unlocked && (
                        <Badge variant="default" className="mt-1">
                          <Award size={12} className="mr-1" />
                          Unlocked
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(challenge.type)} variant="secondary">
                        {challenge.type}
                      </Badge>
                      <h4 className="font-medium">{challenge.title}</h4>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <span>🍯</span>
                      <span>{challenge.reward}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{challenge.progress}/{challenge.maxProgress}</span>
                    </div>
                    <Progress value={(challenge.progress / challenge.maxProgress) * 100} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Ends in: {Math.ceil((challenge.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days</span>
                      {challenge.progress >= challenge.maxProgress && (
                        <Badge variant="default" className="text-xs">
                          <Zap size={10} className="mr-1" />
                          Complete!
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="text-bee-gold" />
                  Honey Store
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Premium Theme</h4>
                    <p className="text-sm text-muted-foreground">Golden bee theme</p>
                  </div>
                  <Button size="sm">100 🍯</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Extra Categories</h4>
                    <p className="text-sm text-muted-foreground">Unlock 5 new categories</p>
                  </div>
                  <Button size="sm">50 🍯</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Advanced Analytics</h4>
                    <p className="text-sm text-muted-foreground">Detailed insights</p>
                  </div>
                  <Button size="sm">200 🍯</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="text-bee-blue" />
                  Real Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Charity Donation</h4>
                    <p className="text-sm text-muted-foreground">$5 to bee conservation</p>
                  </div>
                  <Button size="sm">500 🍯</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Coffee Voucher</h4>
                    <p className="text-sm text-muted-foreground">$10 coffee gift card</p>
                  </div>
                  <Button size="sm">1000 🍯</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                  <div>
                    <h4 className="font-medium">Premium Account</h4>
                    <p className="text-sm text-muted-foreground">1 month free premium</p>
                  </div>
                  <Button size="sm" disabled>2000 🍯</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};