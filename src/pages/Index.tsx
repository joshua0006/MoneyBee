import { useState, useEffect } from "react";
import { ExpenseOverview } from "@/components/ExpenseOverview";
import { EnhancedQuickAddExpense } from "@/components/EnhancedQuickAddExpense";
import { ExpenseList } from "@/components/ExpenseList";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, TrendingUp, BarChart3, Search, Plus, PieChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  saveExpensesToStorage, 
  loadExpensesFromStorage, 
  exportExpensesAsCSV,
  type Expense 
} from "@/utils/expenseUtils";

const Index = () => {
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load data on mount
  useEffect(() => {
    const loadedExpenses = loadExpensesFromStorage();
    setAllExpenses(loadedExpenses);
    setFilteredExpenses(loadedExpenses);
    setIsLoading(false);
  }, []);

  // Save data whenever expenses change
  useEffect(() => {
    if (!isLoading) {
      saveExpensesToStorage(allExpenses);
    }
  }, [allExpenses, isLoading]);

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString()
    };
    setAllExpenses(prev => [newExpense, ...prev]);
  };

  const handleFilteredResults = (filtered: Expense[]) => {
    setFilteredExpenses(filtered);
  };

  const handleExport = () => {
    try {
      exportExpensesAsCSV(filteredExpenses);
      toast({
        title: "📊 Export Successful",
        description: `Exported ${filteredExpenses.length} transactions`,
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export expense data",
        variant: "destructive"
      });
    }
  };

  const totalIncome = allExpenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = allExpenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading your expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-card via-muted/30 to-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-expense/10 rounded-xl shadow-sm">
                <Wallet className="h-6 w-6 text-expense" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Expense Tracker
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Smart expense management</p>
                  <Badge variant="secondary" className="text-xs">
                    {allExpenses.length} transactions
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="p-2 bg-income/10 rounded-xl shadow-sm">
                <TrendingUp className="h-5 w-5 text-income" />
              </div>
              <div className="p-2 bg-primary/10 rounded-xl shadow-sm">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
            <TabsTrigger value="overview" className="flex items-center gap-1 text-xs">
              <BarChart3 size={14} />
              Overview
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-1 text-xs">
              <Plus size={14} />
              Add
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-1 text-xs">
              <Search size={14} />
              Search
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs">
              <PieChart size={14} />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview */}
            <ExpenseOverview 
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
            />

            {/* Category Breakdown */}
            <CategoryBreakdown expenses={allExpenses} />

            {/* Recent Transactions */}
            <ExpenseList expenses={allExpenses.slice(0, 5)} />
            
            {allExpenses.length > 5 && (
              <div className="text-center">
                <Button variant="outline" size="sm">
                  View All {allExpenses.length} Transactions
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <EnhancedQuickAddExpense 
              onAddExpense={handleAddExpense}
              existingExpenses={allExpenses}
            />
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <SearchAndFilter 
              expenses={allExpenses}
              onFilteredResults={handleFilteredResults}
              onExport={handleExport}
            />
            
            <ExpenseList expenses={filteredExpenses} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AdvancedAnalytics expenses={allExpenses} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
