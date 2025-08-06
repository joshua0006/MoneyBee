import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Target, DollarSign, Calendar, Info } from "lucide-react";
import { Expense } from "@/types/app";
import {
  calculateFinancialBaseline,
  projectFinancialGrowth,
  getDefaultScenarios,
  calculateMilestones,
  formatCurrency,
  formatLargeCurrency,
  SimulationParams,
  SimulationScenario
} from "@/utils/simulationUtils";

interface FinancialSimulationProps {
  expenses: Expense[];
}

export const FinancialSimulation = ({ expenses }: FinancialSimulationProps) => {
  const baseline = useMemo(() => calculateFinancialBaseline(expenses), [expenses]);
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
      label: "Income",
      color: "hsl(var(--chart-2))",
    },
    expenses: {
      label: "Expenses",
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
      {/* Current Financial Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Current Financial Overview
          </CardTitle>
          <CardDescription>
            Based on your last 6 months of data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(baseline.monthlyIncome)}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Income</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(baseline.monthlyExpenses)}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Expenses</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${baseline.monthlyNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(baseline.monthlyNet)}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Net</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="customize">Customize</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Net Worth Projection Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Net Worth Projection</CardTitle>
              <CardDescription>
                {selectedScenario.name} scenario over {customParams.timeHorizon} years
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projections}>
                    <XAxis 
                      dataKey="year" 
                      tickFormatter={(value) => `Year ${value}`}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatLargeCurrency(value)}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: any) => [formatCurrency(value), "Net Worth"]}
                      labelFormatter={(value) => `Year ${value}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netWorth" 
                      stroke="var(--color-netWorth)" 
                      strokeWidth={3}
                      dot={{ fill: "var(--color-netWorth)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Key Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Financial Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      milestone.achieved ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{milestone.icon}</span>
                      <div>
                        <div className="font-medium">{milestone.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(milestone.amount)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {milestone.achieved ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Year {milestone.year}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not reached</Badge>
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

          {/* Scenario Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>10-Year Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenarioComparison}>
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatLargeCurrency(value)} />
                    <ChartTooltip 
                      formatter={(value: any) => [formatCurrency(value), "Final Net Worth"]}
                    />
                    <Bar 
                      dataKey="finalNetWorth" 
                      fill="hsl(var(--chart-1))"
                      radius={[4, 4, 0, 0]}
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