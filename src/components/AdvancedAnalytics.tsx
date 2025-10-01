import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, AlertTriangle, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  analyzeWeeklyData,
  analyzeMonthlyData,
  analyzeYearlyData,
  generateSmartInsights,
  type Expense
} from "@/utils/analyticsUtils";
import { MetricCard } from "@/components/analytics/MetricCard";
import { TrendChart } from "@/components/analytics/TrendChart";
import { InsightPanel } from "@/components/analytics/InsightPanel";
import { PeriodSelector } from "@/components/analytics/PeriodSelector";

interface AdvancedAnalyticsProps {
  expenses: Expense[];
}

export const AdvancedAnalytics = ({ expenses }: AdvancedAnalyticsProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  if (expenses.length === 0) {
    return (
      <Card className="shadow-soft border-0" role="status" aria-live="polite">
        <CardContent className="py-8 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
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

  const periods = [
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
    { value: "insights", label: "Insights" }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <PeriodSelector
        periods={periods}
        value={selectedPeriod}
        onValueChange={setSelectedPeriod}
        ariaLabel="Select analytics time period"
      />

      {/* Weekly View */}
      {selectedPeriod === "week" && (
        <div className="space-y-4 md:space-y-6" role="tabpanel" aria-labelledby="week-tab">
          {/* Weekly Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <MetricCard
              label="This Week"
              value={`$${weeklyData.currentWeekSpending.toFixed(0)}`}
              icon={DollarSign}
              iconColor="text-primary"
              ariaLabel={`This week's spending: $${weeklyData.currentWeekSpending.toFixed(0)}`}
            />
            <MetricCard
              label="Weekly Change"
              value={`${weeklyData.weeklyChange >= 0 ? '+' : ''}${weeklyData.weeklyChange.toFixed(1)}%`}
              icon={weeklyData.weeklyChange >= 0 ? TrendingUp : TrendingDown}
              iconColor={weeklyData.weeklyChange >= 0 ? "text-expense" : "text-income"}
              valueColor={weeklyData.weeklyChange >= 0 ? "text-expense" : "text-income"}
              ariaLabel={`Weekly change: ${weeklyData.weeklyChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(weeklyData.weeklyChange).toFixed(1)}%`}
            />
          </div>

          {/* Daily Breakdown */}
          <TrendChart
            title="Daily Breakdown"
            items={weeklyData.dailyBreakdown.map(day => ({
              label: day.day,
              value: day.amount,
              maxValue: weeklyData.currentWeekSpending
            }))}
            ariaLabel="Daily spending breakdown for the week"
          />

          {/* Top Categories */}
          {weeklyData.topCategories.length > 0 && (
            <TrendChart
              title="Top Categories This Week"
              items={weeklyData.topCategories.map(cat => ({
                label: cat.category,
                value: cat.amount,
                percentage: cat.percentage
              }))}
              ariaLabel="Top spending categories this week"
            />
          )}
        </div>
      )}

      {/* Monthly View */}
      {selectedPeriod === "month" && (
        <div className="space-y-4 md:space-y-6" role="tabpanel" aria-labelledby="month-tab">
          {/* Monthly Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <MetricCard
              label="This Month"
              value={`$${monthlyData.currentMonthSpending.toFixed(0)}`}
              icon={Calendar}
              iconColor="text-primary"
              ariaLabel={`This month's spending: $${monthlyData.currentMonthSpending.toFixed(0)}`}
            />
            <MetricCard
              label="Monthly Change"
              value={`${monthlyData.monthlyChange >= 0 ? '+' : ''}${monthlyData.monthlyChange.toFixed(1)}%`}
              icon={monthlyData.monthlyChange >= 0 ? TrendingUp : TrendingDown}
              iconColor={monthlyData.monthlyChange >= 0 ? "text-expense" : "text-income"}
              valueColor={monthlyData.monthlyChange >= 0 ? "text-expense" : "text-income"}
              ariaLabel={`Monthly change: ${monthlyData.monthlyChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(monthlyData.monthlyChange).toFixed(1)}%`}
            />
          </div>

          {/* 6-Month Trend */}
          <Card className="shadow-soft border-0" role="region" aria-label="6-Month Trend">
            <CardContent className="p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold mb-4">6-Month Trend</h3>
              <div className="space-y-3 md:space-y-4">
                {monthlyData.monthlyTrends.map((trend, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b last:border-0">
                    <span className="text-sm md:text-base font-medium">{trend.month}</span>
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <ArrowUpCircle size={14} className="text-income" aria-hidden="true" />
                          <span className="text-xs md:text-sm text-income" aria-label={`Income: $${trend.income.toFixed(0)}`}>
                            ${trend.income.toFixed(0)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowDownCircle size={14} className="text-expense" aria-hidden="true" />
                          <span className="text-xs md:text-sm text-expense" aria-label={`Expenses: $${trend.expenses.toFixed(0)}`}>
                            ${trend.expenses.toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={trend.net >= 0 ? "default" : "destructive"}
                        className="text-xs shrink-0"
                        aria-label={`Net ${trend.net >= 0 ? 'positive' : 'negative'}: $${Math.abs(trend.net).toFixed(0)}`}
                      >
                        {trend.net >= 0 ? '+' : ''}${trend.net.toFixed(0)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          {monthlyData.categoryBreakdown.length > 0 && (
            <TrendChart
              title="Category Breakdown"
              items={monthlyData.categoryBreakdown.slice(0, 5).map(cat => ({
                label: cat.category,
                value: cat.amount,
                percentage: cat.percentage
              }))}
              ariaLabel="Monthly category spending breakdown"
            />
          )}
        </div>
      )}

      {/* Yearly View */}
      {selectedPeriod === "year" && (
        <div className="space-y-4 md:space-y-6" role="tabpanel" aria-labelledby="year-tab">
          {/* Yearly Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <MetricCard
              label="This Year"
              value={`$${yearlyData.currentYearSpending.toFixed(0)}`}
              icon={BarChart3}
              iconColor="text-primary"
              ariaLabel={`This year's spending: $${yearlyData.currentYearSpending.toFixed(0)}`}
            />
            <MetricCard
              label="Yearly Change"
              value={`${yearlyData.yearlyChange >= 0 ? '+' : ''}${yearlyData.yearlyChange.toFixed(1)}%`}
              icon={yearlyData.yearlyChange >= 0 ? TrendingUp : TrendingDown}
              iconColor={yearlyData.yearlyChange >= 0 ? "text-expense" : "text-income"}
              valueColor={yearlyData.yearlyChange >= 0 ? "text-expense" : "text-income"}
              ariaLabel={`Yearly change: ${yearlyData.yearlyChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(yearlyData.yearlyChange).toFixed(1)}%`}
            />
          </div>

          {/* Monthly Trends */}
          <Card className="shadow-soft border-0" role="region" aria-label="Monthly Trends This Year">
            <CardContent className="p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold mb-4">Monthly Trends</h3>
              <div className="space-y-3 md:space-y-4">
                {yearlyData.monthlyTrends.map((trend, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b last:border-0">
                    <span className="text-sm md:text-base font-medium">{trend.month}</span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle size={14} className="text-income" aria-hidden="true" />
                        <span className="text-xs md:text-sm text-income" aria-label={`Income: $${trend.income.toFixed(0)}`}>
                          ${trend.income.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle size={14} className="text-expense" aria-hidden="true" />
                        <span className="text-xs md:text-sm text-expense" aria-label={`Expenses: $${trend.expenses.toFixed(0)}`}>
                          ${trend.expenses.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Seasonal Patterns */}
          <TrendChart
            title="Seasonal Patterns"
            items={yearlyData.seasonalPatterns.map(season => ({
              label: season.season,
              value: season.avgSpending
            }))}
            valueFormatter={(val) => `$${val.toFixed(0)}/month`}
            ariaLabel="Average seasonal spending patterns"
          />
        </div>
      )}

      {/* Insights View */}
      {selectedPeriod === "insights" && (
        <div className="space-y-4 md:space-y-6" role="tabpanel" aria-labelledby="insights-tab">
          <InsightPanel
            title="Spending Alerts"
            icon={AlertTriangle}
            items={insights.spendingAlerts}
            type="alert"
            ariaLabel="Spending alerts and warnings"
          />
          <InsightPanel
            title="Spending Patterns"
            icon={BarChart3}
            items={insights.patterns}
            type="pattern"
            ariaLabel="Identified spending patterns"
          />
          <InsightPanel
            title="Recommendations"
            icon={Target}
            items={insights.recommendations}
            type="recommendation"
            ariaLabel="Financial recommendations"
          />
          <InsightPanel
            title="Achievements"
            icon={TrendingUp}
            items={insights.achievements}
            type="achievement"
            ariaLabel="Financial achievements"
          />
        </div>
      )}
    </div>
  );
};
