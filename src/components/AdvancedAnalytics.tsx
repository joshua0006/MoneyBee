import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, AlertTriangle, Target } from "lucide-react";
import { 
  analyzeWeeklyData, 
  analyzeMonthlyData, 
  analyzeYearlyData, 
  generateSmartInsights,
  type Expense
} from "@/utils/analyticsUtils";

interface AdvancedAnalyticsProps {
  expenses: Expense[];
}

export const AdvancedAnalytics = ({ expenses }: AdvancedAnalyticsProps) => {
  if (expenses.length === 0) {
    return (
      <Card className="shadow-soft border-0">
        <CardContent className="py-8 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No data to analyze yet</p>
          <p className="text-sm text-muted-foreground">Add some transactions to see insights</p>
        </CardContent>
      </Card>
    );
  }

  const weeklyData = analyzeWeeklyData(expenses);
  const monthlyData = analyzeMonthlyData(expenses);
  const yearlyData = analyzeYearlyData(expenses);
  const insights = generateSmartInsights(expenses);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="week" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="space-y-4 mt-6">
          {/* Weekly Overview */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-soft border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <p className="text-xl font-bold">${weeklyData.currentWeekSpending.toFixed(0)}</p>
                  </div>
                  <DollarSign className="text-primary" size={20} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Weekly Change</p>
                    <p className={`text-xl font-bold ${weeklyData.weeklyChange >= 0 ? 'text-expense' : 'text-income'}`}>
                      {weeklyData.weeklyChange >= 0 ? '+' : ''}{weeklyData.weeklyChange.toFixed(1)}%
                    </p>
                  </div>
                  {weeklyData.weeklyChange >= 0 ? (
                    <TrendingUp className="text-expense" size={20} />
                  ) : (
                    <TrendingDown className="text-income" size={20} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Breakdown */}
          <Card className="shadow-soft border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Daily Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {weeklyData.dailyBreakdown.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{day.day}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: weeklyData.currentWeekSpending > 0 
                            ? `${(day.amount / weeklyData.currentWeekSpending) * 100}%` 
                            : '0%' 
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">${day.amount.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Categories This Week */}
          {weeklyData.topCategories.length > 0 && (
            <Card className="shadow-soft border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Top Categories This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {weeklyData.topCategories.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.category}</span>
                    <div className="text-right">
                      <p className="font-semibold text-sm">${category.amount.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="month" className="space-y-4 mt-6">
          {/* Monthly Overview */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-soft border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-xl font-bold">${monthlyData.currentMonthSpending.toFixed(0)}</p>
                  </div>
                  <Calendar className="text-primary" size={20} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Change</p>
                    <p className={`text-xl font-bold ${monthlyData.monthlyChange >= 0 ? 'text-expense' : 'text-income'}`}>
                      {monthlyData.monthlyChange >= 0 ? '+' : ''}{monthlyData.monthlyChange.toFixed(1)}%
                    </p>
                  </div>
                  {monthlyData.monthlyChange >= 0 ? (
                    <TrendingUp className="text-expense" size={20} />
                  ) : (
                    <TrendingDown className="text-income" size={20} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 6-Month Trend */}
          <Card className="shadow-soft border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">6-Month Trend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {monthlyData.monthlyTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">{trend.month}</span>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle size={14} className="text-income" />
                        <span className="text-sm text-income">${trend.income.toFixed(0)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle size={14} className="text-expense" />
                        <span className="text-sm text-expense">${trend.expenses.toFixed(0)}</span>
                      </div>
                    </div>
                    <Badge 
                      variant={trend.net >= 0 ? "default" : "destructive"} 
                      className="text-xs"
                    >
                      {trend.net >= 0 ? '+' : ''}${trend.net.toFixed(0)}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          {monthlyData.categoryBreakdown.length > 0 && (
            <Card className="shadow-soft border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {monthlyData.categoryBreakdown.slice(0, 5).map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.category}</span>
                    <div className="text-right">
                      <p className="font-semibold text-sm">${category.amount.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="year" className="space-y-4 mt-6">
          {/* Yearly Overview */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-soft border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Year</p>
                    <p className="text-xl font-bold">${yearlyData.currentYearSpending.toFixed(0)}</p>
                  </div>
                  <BarChart3 className="text-primary" size={20} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Yearly Change</p>
                    <p className={`text-xl font-bold ${yearlyData.yearlyChange >= 0 ? 'text-expense' : 'text-income'}`}>
                      {yearlyData.yearlyChange >= 0 ? '+' : ''}{yearlyData.yearlyChange.toFixed(1)}%
                    </p>
                  </div>
                  {yearlyData.yearlyChange >= 0 ? (
                    <TrendingUp className="text-expense" size={20} />
                  ) : (
                    <TrendingDown className="text-income" size={20} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trends This Year */}
          <Card className="shadow-soft border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {yearlyData.monthlyTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">{trend.month}</span>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle size={14} className="text-income" />
                        <span className="text-sm text-income">${trend.income.toFixed(0)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle size={14} className="text-expense" />
                        <span className="text-sm text-expense">${trend.expenses.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Seasonal Patterns */}
          <Card className="shadow-soft border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Seasonal Patterns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {yearlyData.seasonalPatterns.map((season, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{season.season}</span>
                  <span className="text-sm font-semibold">${season.avgSpending.toFixed(0)}/month</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4 mt-6">
          {/* Spending Alerts */}
          {insights.spendingAlerts.length > 0 && (
            <Card className="shadow-soft border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="text-orange-500" size={20} />
                  Spending Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.spendingAlerts.map((alert, index) => (
                  <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">{alert}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Patterns */}
          {insights.patterns.length > 0 && (
            <Card className="shadow-soft border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="text-blue-500" size={20} />
                  Spending Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.patterns.map((pattern, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">{pattern}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {insights.recommendations.length > 0 && (
            <Card className="shadow-soft border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="text-green-500" size={20} />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">{recommendation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          {insights.achievements.length > 0 && (
            <Card className="shadow-soft border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="text-purple-500" size={20} />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.achievements.map((achievement, index) => (
                  <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800">{achievement}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};