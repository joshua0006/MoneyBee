import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Camera, Receipt, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSmartSuggestions, type Expense } from "@/utils/expenseUtils";

interface QuickAddExpenseProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  existingExpenses: Expense[];
}

const categories = [
  "Food & Dining",
  "Transportation", 
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Travel",
  "Education",
  "Personal Care",
  "Other"
];

const quickAmounts = [5, 10, 15, 20, 25, 50];

export const EnhancedQuickAddExpense = ({ onAddExpense, existingExpenses }: QuickAddExpenseProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const descriptionRef = useRef<HTMLInputElement>(null);

  // Smart suggestions based on input
  useEffect(() => {
    if (description.length >= 2) {
      const smartSuggestions = getSmartSuggestions(existingExpenses, description);
      setSuggestions(smartSuggestions);
      setShowSuggestions(smartSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [description, existingExpenses]);

  // Auto-suggest category based on description
  const suggestCategoryFromDescription = (desc: string): string => {
    const lowerDesc = desc.toLowerCase();
    
    const categoryMap: Record<string, string[]> = {
      "Food & Dining": ["coffee", "restaurant", "lunch", "dinner", "breakfast", "food", "pizza", "burger", "cafe"],
      "Transportation": ["gas", "fuel", "uber", "taxi", "bus", "train", "parking", "metro"],
      "Shopping": ["store", "mall", "amazon", "target", "walmart", "clothes", "shoes"],
      "Entertainment": ["movie", "cinema", "netflix", "spotify", "game", "concert", "theater"],
      "Bills & Utilities": ["electric", "water", "phone", "internet", "rent", "mortgage", "insurance"],
      "Healthcare": ["doctor", "pharmacy", "medicine", "hospital", "dental", "prescription"],
      "Travel": ["hotel", "flight", "vacation", "trip", "booking", "airbnb"],
      "Education": ["school", "book", "course", "tuition", "university", "college"],
      "Personal Care": ["haircut", "salon", "beauty", "spa", "gym", "fitness"]
    };

    for (const [cat, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        return cat;
      }
    }
    
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description) {
      toast({
        title: "Missing Information",
        description: "Please enter an amount and description",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Auto-suggest category if not selected
    const finalCategory = category || suggestCategoryFromDescription(description) || "Other";

    const expense: Omit<Expense, 'id'> = {
      amount: parseFloat(amount),
      description: description.trim(),
      category: finalCategory,
      date: new Date(),
      type
    };

    // Simulate processing time for better UX
    setTimeout(() => {
      onAddExpense(expense);
      
      // Reset form
      setAmount("");
      setDescription("");
      setCategory("");
      setShowSuggestions(false);
      setIsLoading(false);
      
      toast({
        title: type === 'expense' ? "💳 Expense Added" : "💰 Income Added",
        description: `$${amount} for ${description}`,
        duration: 2000
      });
    }, 300);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleSuggestionClick = (suggestion: string) => {
    setDescription(suggestion);
    setShowSuggestions(false);
    
    // Auto-suggest category based on the selected suggestion
    const suggestedCategory = suggestCategoryFromDescription(suggestion);
    if (suggestedCategory && !category) {
      setCategory(suggestedCategory);
    }
    
    descriptionRef.current?.focus();
  };

  const getLastUsedCategories = () => {
    const recentCategories = existingExpenses
      .slice(0, 10) // Last 10 transactions
      .map(e => e.category)
      .filter((cat, index, arr) => arr.indexOf(cat) === index) // Remove duplicates
      .slice(0, 3); // Top 3 most recent unique categories
    
    return recentCategories;
  };

  const recentCategories = getLastUsedCategories();

  return (
    <Card className="shadow-soft border-0 overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-background to-muted/30">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-1 bg-primary/10 rounded-full">
            <Plus size={16} className="text-primary" />
          </div>
          Quick Add
          {isLoading && (
            <div className="animate-spin">
              <Zap size={16} className="text-primary" />
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              type="button"
              variant={type === 'expense' ? 'expense' : 'ghost'}
              className="flex-1 relative overflow-hidden"
              onClick={() => setType('expense')}
              disabled={isLoading}
            >
              {type === 'expense' && (
                <div className="absolute inset-0 bg-gradient-to-r from-expense to-expense/80" />
              )}
              <span className="relative">💳 Expense</span>
            </Button>
            <Button
              type="button"
              variant={type === 'income' ? 'income' : 'ghost'}
              className="flex-1 relative overflow-hidden"
              onClick={() => setType('income')}
              disabled={isLoading}
            >
              {type === 'income' && (
                <div className="absolute inset-0 bg-gradient-to-r from-income to-income/80" />
              )}
              <span className="relative">💰 Income</span>
            </Button>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg">$</span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-lg font-semibold"
                disabled={isLoading}
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-6 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(quickAmount)}
                  className="text-xs hover:scale-105 transition-transform"
                  disabled={isLoading}
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Description with Smart Suggestions */}
          <div className="space-y-2 relative">
            <label className="text-sm font-medium">Description</label>
            <Input
              ref={descriptionRef}
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="transition-all duration-200"
              disabled={isLoading}
            />
            
            {/* Smart Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 z-10 bg-background border border-border rounded-md shadow-lg max-h-32 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Zap size={12} className="text-primary" />
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category with Smart Suggestions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            
            {/* Recent Categories Quick Select */}
            {recentCategories.length > 0 && (
              <div className="flex gap-2 mb-2">
                <span className="text-xs text-muted-foreground self-center">Recent:</span>
                {recentCategories.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    variant={category === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategory(cat)}
                    className="text-xs"
                    disabled={isLoading}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            )}
            
            <Select value={category} onValueChange={setCategory} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              variant={type === 'expense' ? 'expense' : 'income'}
              className="flex-1 relative overflow-hidden group"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Plus size={16} />
              {isLoading ? 'Adding...' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              disabled={isLoading}
              className="hover:scale-105 transition-transform"
            >
              <Camera size={16} />
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              disabled={isLoading}
              className="hover:scale-105 transition-transform"
            >
              <Receipt size={16} />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};