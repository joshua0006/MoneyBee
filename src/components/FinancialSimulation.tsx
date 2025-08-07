import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar,
  PiggyBank,
  Home,
  Car,
  GraduationCap,
  Plane,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calculator,
  Lightbulb,
  Zap,
  Shield
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import type { Expense } from '@/types/app';

interface FinancialSimulationProps {
  expenses: Expense[];
}

interface ScenarioConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  fields: {
    targetAmount: number;
    timeframe: number;
    initialAmount?: number;
    monthlyContribution?: number;
    interestRate?: number;
  };
}

const predefinedScenarios: ScenarioConfig[] = [
  {
    id: 'emergency',
    name: 'Emergency Fund',
    icon: <Shield className="w-5 h-5" />,
    description: 'Build 3-6 months of expenses as emergency savings',
    color: '#ef4444',
    fields: {
      targetAmount: 10000,
      timeframe: 12,
      initialAmount: 0,
      monthlyContribution: 800,
      interestRate: 2.5
    }
  },
  {
    id: 'house',
    name: 'House Down Payment',
    icon: <Home className="w-5 h-5" />,
    description: 'Save for your dream home down payment',
    color: '#3b82f6',
    fields: {
      targetAmount: 60000,
      timeframe: 36,
      initialAmount: 5000,
      monthlyContribution: 1500,
      interestRate: 3.0
    }
  },
  {
    id: 'car',
    name: 'Car Purchase',
    icon: <Car className="w-5 h-5" />,
    description: 'Save up for a reliable vehicle',
    color: '#10b981',
    fields: {
      targetAmount: 25000,
      timeframe: 24,
      initialAmount: 2000,
      monthlyContribution: 950,
      interestRate: 2.0
    }
  },
  {
    id: 'education',
    name: 'Education Fund',
    icon: <GraduationCap className="w-5 h-5" />,
    description: 'Invest in education or professional development',
    color: '#8b5cf6',
    fields: {
      targetAmount: 40000,
      timeframe: 48,
      initialAmount: 3000,
      monthlyContribution: 750,
      interestRate: 4.0
    }
  },
  {
    id: 'vacation',
    name: 'Dream Vacation',
    icon: <Plane className="w-5 h-5" />,
    description: 'Plan and save for your perfect getaway',
    color: '#f59e0b',
    fields: {
      targetAmount: 8000,
      timeframe: 18,
      initialAmount: 500,
      monthlyContribution: 400,
      interestRate: 1.5
    }
  },
  {
    id: 'retirement',
    name: 'Retirement Boost',
    icon: <PiggyBank className="w-5 h-5" />,
    description: 'Accelerate your retirement savings',
    color: '#06b6d4',
    fields: {
      targetAmount: 500000,
      timeframe: 240,
      initialAmount: 25000,
      monthlyContribution: 1200,
      interestRate: 7.0
    }
  }
];

export function FinancialSimulation({ expenses }: FinancialSimulationProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>('emergency');
  const [customMode, setCustomMode] = useState(false);
  const [targetAmount, setTargetAmount] = useState(10000);
  const [timeframe, setTimeframe] = useState(12);
  const [initialAmount, setInitialAmount] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(800);
  const [interestRate, setInterestRate] = useState(2.5);

  // Calculate current spending patterns
  const monthlySpending = useMemo(() => {
    const totalExpenses = expenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const months = Math.max(1, Math.ceil(expenses.length / 30));
    return totalExpenses / months;
  }, [expenses]);

  const currentScenario = customMode 
    ? {
        id: 'custom',
        name: 'Custom Goal',
        icon: <Calculator className="w-5 h-5" />,
        description: 'Create your own savings scenario',
        color: '#6366f1',
        fields: { targetAmount, timeframe, initialAmount, monthlyContribution, interestRate }
      }
    : predefinedScenarios.find(s => s.id === selectedScenario) || predefinedScenarios[0];

  // Load scenario values
  React.useEffect(() => {
    if (!customMode && currentScenario) {
      setTargetAmount(currentScenario.fields.targetAmount);
      setTimeframe(currentScenario.fields.timeframe);
      setInitialAmount(currentScenario.fields.initialAmount || 0);
      setMonthlyContribution(currentScenario.fields.monthlyContribution || 0);
      setInterestRate(currentScenario.fields.interestRate || 2.5);
    }
  }, [selectedScenario, customMode, currentScenario]);

  // Calculate projection data
  const projectionData = useMemo(() => {
    const data = [];
    let currentBalance = initialAmount;
    const monthlyRate = interestRate / 100 / 12;
    
    for (let month = 0; month <= timeframe; month++) {
      if (month > 0) {
        currentBalance += monthlyContribution;
        currentBalance = currentBalance * (1 + monthlyRate);
      }
      
      data.push({
        month,
        balance: Math.round(currentBalance),
        target: targetAmount,
        contributions: month * monthlyContribution + initialAmount,
        interest: Math.round(currentBalance - (month * monthlyContribution + initialAmount))
      });
    }
    
    return data;
  }, [targetAmount, timeframe, initialAmount, monthlyContribution, interestRate]);

  const finalBalance = projectionData[projectionData.length - 1]?.balance || 0;
  const totalContributions = timeframe * monthlyContribution + initialAmount;
  const totalInterest = finalBalance - totalContributions;
  const willReachGoal = finalBalance >= targetAmount;
  const progressPercentage = Math.min(100, (finalBalance / targetAmount) * 100);

  // Calculate required monthly contribution
  const requiredMonthlyContribution = useMemo(() => {
    if (timeframe === 0) return 0;
    
    const monthlyRate = interestRate / 100 / 12;
    const futureValueFactor = ((Math.pow(1 + monthlyRate, timeframe) - 1) / monthlyRate);
    const futureValueOfInitial = initialAmount * Math.pow(1 + monthlyRate, timeframe);
    
    return Math.max(0, (targetAmount - futureValueOfInitial) / futureValueFactor);
  }, [targetAmount, timeframe, initialAmount, interestRate]);

  // Spending recommendations
  const spendingRecommendations = useMemo(() => {
    const categories = expenses.reduce((acc, expense) => {
      if (expense.type === 'expense') {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, amount]) => ({
        category,
        amount,
        reduction: Math.round(amount * 0.1),
      }));
  }, [expenses]);

  // Scenario comparison data
  const scenarioComparison = useMemo(() => {
    return predefinedScenarios.map(scenario => {
      const projections = [];
      let balance = scenario.fields.initialAmount || 0;
      const monthlyRate = (scenario.fields.interestRate || 2.5) / 100 / 12;
      
      for (let month = 0; month <= scenario.fields.timeframe; month++) {
        if (month > 0) {
          balance += (scenario.fields.monthlyContribution || 0);
          balance = balance * (1 + monthlyRate);
        }
      }
      
      return {
        name: scenario.name,
        finalBalance: Math.round(balance),
        color: scenario.color,
        timeframe: scenario.fields.timeframe,
        target: scenario.fields.targetAmount
      };
    });
  }, []);

  if (expenses.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Start Your Financial Journey</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Add some expenses and income to unlock personalized financial scenarios and projections
              </p>
              <div className="mt-6 flex justify-center">
                <Badge variant="secondary" className="text-xs">
                  💡 Your data powers smart insights
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/5 via-background to-primary/5 border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="w-6 h-6 text-primary" />
                Financial Scenarios
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Visualize your financial goals and create actionable savings plans
              </p>
            </div>
            <Badge variant={willReachGoal ? "default" : "secondary"} className="text-xs">
              {willReachGoal ? "✅ Goal Achievable" : "⚠️ Needs Adjustment"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Scenario Selection */}
      <Tabs value={customMode ? "custom" : "presets"} onValueChange={(v) => setCustomMode(v === "custom")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presets">Preset Scenarios</TabsTrigger>
          <TabsTrigger value="custom">Custom Goal</TabsTrigger>
        </TabsList>
        
        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {predefinedScenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedScenario === scenario.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedScenario(scenario.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div 
                      className={`p-2 rounded-lg ${
                        selectedScenario === scenario.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                      style={{ 
                        backgroundColor: selectedScenario === scenario.id ? scenario.color : undefined 
                      }}
                    >
                      {scenario.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{scenario.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {scenario.description}
                      </p>
                      <div className="mt-2 text-xs font-medium" style={{ color: scenario.color }}>
                        ${scenario.fields.targetAmount.toLocaleString()} goal
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Custom Financial Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custom-target">Target Amount ($)</Label>
                  <Input
                    id="custom-target"
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="custom-timeframe">Timeframe (months)</Label>
                  <Input
                    id="custom-timeframe"
                    type="number"
                    value={timeframe}
                    onChange={(e) => setTimeframe(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Current Scenario Display */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg text-white"
                style={{ backgroundColor: currentScenario.color }}
              >
                {currentScenario.icon}
              </div>
              <div>
                <CardTitle className="text-lg">{currentScenario.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{currentScenario.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                ${targetAmount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {timeframe} months
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Overview */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progress to Goal</span>
              <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${finalBalance.toLocaleString()} projected</span>
              <span>${targetAmount.toLocaleString()} target</span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold text-primary">
                ${monthlyContribution.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Monthly Savings</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                ${totalInterest.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Interest Earned</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold">
                {timeframe}
              </div>
              <div className="text-xs text-muted-foreground">Months to Goal</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold">
                {interestRate}%
              </div>
              <div className="text-xs text-muted-foreground">Annual Return</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Adjust Parameters
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Fine-tune your scenario and see real-time impact
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Initial Amount: ${initialAmount.toLocaleString()}</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInitialAmount(0)}
                >
                  Reset
                </Button>
              </div>
              <Slider
                value={[initialAmount]}
                onValueChange={([value]) => setInitialAmount(value)}
                max={targetAmount * 0.5}
                step={100}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Monthly Contribution: ${monthlyContribution.toLocaleString()}</Label>
                <Badge variant="outline" className="text-xs">
                  ${requiredMonthlyContribution.toFixed(0)} required
                </Badge>
              </div>
              <Slider
                value={[monthlyContribution]}
                onValueChange={([value]) => setMonthlyContribution(value)}
                max={Math.max(2000, requiredMonthlyContribution * 1.5)}
                step={25}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Expected Annual Return: {interestRate}%</Label>
                <Badge variant="outline" className="text-xs">
                  Conservative: 2-4%
                </Badge>
              </div>
              <Slider
                value={[interestRate]}
                onValueChange={([value]) => setInterestRate(value)}
                min={0.5}
                max={12}
                step={0.5}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Timeframe: {timeframe} months</Label>
                <Badge variant="outline" className="text-xs">
                  {Math.floor(timeframe / 12)}y {timeframe % 12}m
                </Badge>
              </div>
              <Slider
                value={[timeframe]}
                onValueChange={([value]) => setTimeframe(value)}
                min={6}
                max={360}
                step={6}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projection Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Growth Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}m`}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`,
                    name === 'balance' ? 'Total Balance' : 
                    name === 'contributions' ? 'Total Contributions' : 
                    name === 'target' ? 'Target Goal' : name
                  ]}
                  labelFormatter={(month) => `Month ${month}`}
                />
                <Area
                  type="monotone"
                  dataKey="contributions"
                  stackId="1"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted))"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="interest"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted rounded"></div>
              <span>Contributions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>Interest Growth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-destructive border-dashed rounded"></div>
              <span>Target Goal</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Scenario Comparison
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Compare different financial goals side by side
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scenarioComparison.map((scenario, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: scenario.color }}
                  ></div>
                  <div>
                    <div className="font-medium text-sm">{scenario.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.floor(scenario.timeframe / 12)}y {scenario.timeframe % 12}m
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">
                    ${scenario.finalBalance.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Target: ${scenario.target.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spending Optimization */}
      {spendingRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Spending Optimization
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Based on your current spending patterns, here are areas to optimize:
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {spendingRecommendations.map((rec, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{rec.category}</div>
                    <div className="text-xs text-muted-foreground">
                      Current: ${rec.amount.toFixed(0)}/month
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      Save ${rec.reduction}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      10% reduction
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-sm font-medium text-primary">
                  💡 Potential Monthly Savings: ${spendingRecommendations.reduce((sum, rec) => sum + rec.reduction, 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  These optimizations could boost your monthly contribution significantly
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                Next Steps to Reach Your Goal
              </h3>
              <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
                {!willReachGoal && (
                  <div>• Increase monthly contribution to ${requiredMonthlyContribution.toFixed(0)} or extend timeline</div>
                )}
                <div>• Consider high-yield savings account (2-4% APY)</div>
                <div>• Set up automatic transfers on payday</div>
                <div>• Review and reduce spending in top categories</div>
                {timeframe > 36 && (
                  <div>• For long-term goals, consider investment accounts</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}