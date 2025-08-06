import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Area, AreaChart, CartesianGrid } from "recharts";
import { TrendingUp, Target, DollarSign, Calendar, Info, Edit3, Calculator } from "lucide-react";
import { Expense } from "@/types/app";
import {
  calculateFinancialBaseline,
  projectFinancialGrowth,
  getDefaultScenarios,
  calculateMilestones,
  formatCurrency,
  formatLargeCurrency,
  getMotivationalMessage,
  getTimelineGoals,
  getInspirationalQuotes,
  getAchievementCards,
  SimulationParams,
  SimulationScenario
} from "@/utils/simulationUtils";

interface FinancialSimulationProps {
  expenses: Expense[];
}

export const FinancialSimulation = ({ expenses }: FinancialSimulationProps) => {
  const calculatedBaseline = useMemo(() => calculateFinancialBaseline(expenses), [expenses]);
  const [useManualInput, setUseManualInput] = useState(false);
  const [manualIncome, setManualIncome] = useState(calculatedBaseline.monthlyIncome.toString());
  const [manualExpenses, setManualExpenses] = useState(calculatedBaseline.monthlyExpenses.toString());
  
  // Use manual input if enabled, otherwise use calculated baseline
  const baseline = useMemo(() => {
    if (useManualInput) {
      const income = parseFloat(manualIncome) || 0;
      const expenses = parseFloat(manualExpenses) || 0;
      return {
        monthlyIncome: income,
        monthlyExpenses: expenses,
        monthlyNet: income - expenses
      };
    }
    return calculatedBaseline;
  }, [useManualInput, manualIncome, manualExpenses, calculatedBaseline]);
  
  const defaultScenarios = useMemo(() => getDefaultScenarios(), []);
  
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>(defaultScenarios[1]);
  const [customParams, setCustomParams] = useState<SimulationParams>(selectedScenario.params);
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate projections based on current parameters
  const projections = useMemo(() => {
    return projectFinancialGrowth(baseline, customParams);
  }, [baseline, customParams]);

  const milestones = useMemo(() => {
    return calculateMilestones(projections);
  }, [projections]);

  const motivationalMessage = useMemo(() => {
    return getMotivationalMessage(baseline, projections);
  }, [baseline, projections]);

  const timelineGoals = useMemo(() => {
    return getTimelineGoals(projections);
  }, [projections]);

  const achievementCards = useMemo(() => {
    return getAchievementCards(projections, baseline);
  }, [projections, baseline]);

  const inspirationalQuote = useMemo(() => {
    const quotes = getInspirationalQuotes();
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, []);

  // Scenario comparison data
  const scenarioComparison = useMemo(() => {
    return defaultScenarios.map(scenario => {
      const scenarioProjections = projectFinancialGrowth(baseline, scenario.params);
      return {
        name: scenario.name,
        finalNetWorth: scenarioProjections[scenarioProjections.length - 1]?.netWorth || 0,
        color: scenario.color
      };
    });
  }, [baseline, defaultScenarios]);

  const chartConfig = {
    netWorth: {
      label: "Net Worth",
      color: "hsl(var(--chart-1))",
    },
    income: {
      label: "Annual Income",
      color: "hsl(var(--income))",
    },
    expenses: {
      label: "Annual Expenses", 
      color: "hsl(var(--expense))",
    },
    conservative: {
      label: "Conservative",
      color: "hsl(var(--chart-1))",
    },
    moderate: {
      label: "Moderate", 
      color: "hsl(var(--chart-2))",
    },
    aggressive: {
      label: "Aggressive",
      color: "hsl(var(--chart-3))",
    },
  };

  const updateCustomParam = (key: keyof SimulationParams, value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    setCustomParams(prev => ({ ...prev, [key]: newValue }));
  };

  const applyScenario = (scenario: SimulationScenario) => {
    setSelectedScenario(scenario);
    setCustomParams(scenario.params);
  };

  const handleManualIncomeChange = (value: string) => {
    setManualIncome(value);
  };

  const handleManualExpensesChange = (value: string) => {
    setManualExpenses(value);
  };

  if (expenses.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start Your Financial Journey</h3>
              <p className="text-muted-foreground">
                Add some expenses and income to see personalized financial projections
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Financial Overview with Manual Input Option */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle>Financial Overview</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={useManualInput}
                onCheckedChange={setUseManualInput}
                id="manual-input"
              />
              <Label htmlFor="manual-input" className="text-sm font-medium flex items-center gap-1">
                <Edit3 className="h-4 w-4" />
                Manual Input
              </Label>
            </div>
          </div>
          <CardDescription>
            {useManualInput ? "Enter your own income and expense values" : "Based on your last 6 months of data"}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {useManualInput ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="manual-income" className="text-sm font-medium text-income">Monthly Income</Label>
                <Input
                  id="manual-income"
                  type="number"
                  value={manualIncome}
                  onChange={(e) => handleManualIncomeChange(e.target.value)}
                  placeholder="Enter monthly income"
                  className="border-income/20 focus:border-income"
                />
                <div className="text-center">
                  <div className="text-2xl font-bold text-income">
                    {formatCurrency(parseFloat(manualIncome) || 0)}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-expenses" className="text-sm font-medium text-expense">Monthly Expenses</Label>
                <Input
                  id="manual-expenses"
                  type="number"
                  value={manualExpenses}
                  onChange={(e) => handleManualExpensesChange(e.target.value)}
                  placeholder="Enter monthly expenses"
                  className="border-expense/20 focus:border-expense"
                />
                <div className="text-center">
                  <div className="text-2xl font-bold text-expense">
                    {formatCurrency(parseFloat(manualExpenses) || 0)}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Monthly Net</Label>
                <div className="h-10 flex items-center justify-center">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${baseline.monthlyNet >= 0 ? 'text-income' : 'text-expense'}`}>
                    {formatCurrency(baseline.monthlyNet)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-income/10 border border-income/20">
                <div className="text-2xl font-bold text-income">
                  {formatCurrency(baseline.monthlyIncome)}
                </div>
                <div className="text-sm text-muted-foreground">Monthly Income</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-expense/10 border border-expense/20">
                <div className="text-2xl font-bold text-expense">
                  {formatCurrency(baseline.monthlyExpenses)}
                </div>
                <div className="text-sm text-muted-foreground">Monthly Expenses</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className={`text-2xl font-bold ${baseline.monthlyNet >= 0 ? 'text-income' : 'text-expense'}`}>
                  {formatCurrency(baseline.monthlyNet)}
                </div>
                <div className="text-sm text-muted-foreground">Monthly Net</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="customize">Customize</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Motivational Message */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Your Financial Journey</h3>
                <p className="text-muted-foreground mb-4">{motivationalMessage}</p>
                <div className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-4">
                  "{inspirationalQuote}"
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievement Cards */}
          <div className="grid grid-cols-2 gap-4">
            {achievementCards.map((card, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-10`}></div>
                <CardContent className="pt-6 relative">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{card.icon}</div>
                    <div className="text-lg font-bold">{card.value}</div>
                    <div className="text-sm font-medium">{card.title}</div>
                    <div className="text-xs text-muted-foreground">{card.subtitle}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Timeline Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Your Financial Timeline
              </CardTitle>
              <CardDescription>
                Key milestones on your wealth-building journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timelineGoals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
                    <div className="flex-shrink-0">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {goal.timeframe}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{goal.goal}</div>
                      <div className="text-sm text-muted-foreground">{goal.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{formatLargeCurrency(goal.amount)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Net Worth Projection Chart */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Net Worth Growth Projection
              </CardTitle>
              <CardDescription>
                {selectedScenario.name} scenario over {customParams.timeHorizon} years
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ChartContainer config={chartConfig} className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projections} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="year" 
                      tickFormatter={(value) => `Year ${value}`}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatLargeCurrency(value)}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "var(--shadow-medium)"
                      }}
                      formatter={(value: any) => [formatCurrency(value), "Net Worth"]}
                      labelFormatter={(value) => `Year ${value}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="netWorth"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fill="url(#netWorthGradient)"
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Key Milestones with Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Financial Milestones
              </CardTitle>
              <CardDescription>
                Your roadmap to financial success and life goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      milestone.achieved 
                        ? 'bg-green-50 border-green-200 shadow-sm' 
                        : 'bg-muted/30 border-muted hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{milestone.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{milestone.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {milestone.category}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {formatCurrency(milestone.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground italic">
                          {milestone.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {milestone.achieved ? (
                        <div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 mb-1">
                            ✨ Year {milestone.year}
                          </Badge>
                          <div className="text-xs text-green-600 font-medium">Achievable!</div>
                        </div>
                      ) : (
                        <div>
                          <Badge variant="outline">Beyond timeline</Badge>
                          <div className="text-xs text-muted-foreground mt-1">Keep growing</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          {/* Scenario Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Growth Scenarios</CardTitle>
              <CardDescription>
                Compare different financial growth strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {defaultScenarios.map((scenario, index) => (
                  <Button
                    key={index}
                    variant={selectedScenario.name === scenario.name ? "default" : "outline"}
                    className="h-auto p-4 justify-start"
                    onClick={() => applyScenario(scenario)}
                  >
                    <div className="text-left">
                      <div className="font-semibold">{scenario.name}</div>
                      <div className="text-sm opacity-80">{scenario.description}</div>
                      <div className="text-xs mt-1 opacity-60">
                        Income: +{scenario.params.incomeGrowthRate}%/yr | 
                        Investment: {scenario.params.investmentReturn}%/yr
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Scenario Comparison Chart */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                10-Year Scenario Comparison
              </CardTitle>
              <CardDescription>
                Compare potential outcomes across different growth strategies
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenarioComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatLargeCurrency(value)}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <ChartTooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "var(--shadow-medium)"
                      }}
                      formatter={(value: any) => [formatCurrency(value), "Final Net Worth"]}
                    />
                    <Bar 
                      dataKey="finalNetWorth" 
                      fill="hsl(var(--primary))"
                      radius={[8, 8, 0, 0]}
                      className="drop-shadow-sm"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customize" className="space-y-6">
          {/* Custom Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Customize Your Projection</CardTitle>
              <CardDescription>
                Adjust parameters to see how different factors affect your financial growth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Annual Income Growth</label>
                    <span className="text-sm text-muted-foreground">{customParams.incomeGrowthRate}%</span>
                  </div>
                  <Slider
                    value={[customParams.incomeGrowthRate]}
                    onValueChange={(value) => updateCustomParam('incomeGrowthRate', value)}
                    max={15}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Expense Inflation</label>
                    <span className="text-sm text-muted-foreground">{customParams.expenseInflationRate}%</span>
                  </div>
                  <Slider
                    value={[customParams.expenseInflationRate]}
                    onValueChange={(value) => updateCustomParam('expenseInflationRate', value)}
                    max={10}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Additional Monthly Savings</label>
                    <span className="text-sm text-muted-foreground">${customParams.additionalSavings}</span>
                  </div>
                  <Slider
                    value={[customParams.additionalSavings]}
                    onValueChange={(value) => updateCustomParam('additionalSavings', value)}
                    max={2000}
                    min={0}
                    step={50}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Investment Return</label>
                    <span className="text-sm text-muted-foreground">{customParams.investmentReturn}%</span>
                  </div>
                  <Slider
                    value={[customParams.investmentReturn]}
                    onValueChange={(value) => updateCustomParam('investmentReturn', value)}
                    max={15}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Time Horizon</label>
                    <span className="text-sm text-muted-foreground">{customParams.timeHorizon} years</span>
                  </div>
                  <Slider
                    value={[customParams.timeHorizon]}
                    onValueChange={(value) => updateCustomParam('timeHorizon', value)}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>Projections are estimates based on your historical data and assumptions</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projected Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Projection Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-lg font-bold">
                    {formatCurrency(projections[projections.length - 1]?.netWorth || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Net Worth in {customParams.timeHorizon} years
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-lg font-bold">
                    {formatCurrency((projections[projections.length - 1]?.netWorth || 0) / customParams.timeHorizon / 12)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Monthly Growth
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};