import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Camera, Receipt, Zap, Sparkles, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSmartSuggestions, type Expense, type Account } from "@/utils/expenseUtils";
import { EnhancedExpenseParser, type ParsedExpense } from "@/utils/enhancedExpenseParser";

interface QuickAddExpenseProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  existingExpenses: Expense[];
  accounts: Account[];
}

const categories = [
  'Food', 'Entertainment', 'Transport', 'Groceries', 'Housing', 'Clothing', 
  'Utilities', 'Health', 'Education', 'Insurance', 'Tax', 'Work', 'Donations', 'Other'
];

const quickAmounts = [5, 10, 15, 20, 25, 50];

export const EnhancedQuickAddExpense = ({ onAddExpense, existingExpenses, accounts }: QuickAddExpenseProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [isRecurring, setIsRecurring] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // AI Recognition states
  const [aiMode, setAiMode] = useState(true);
  const [aiInput, setAiInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [aiParseSuccess, setAiParseSuccess] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedExpense | null>(null);
  
  const { toast } = useToast();
  const descriptionRef = useRef<HTMLInputElement>(null);
  const aiInputRef = useRef<HTMLTextAreaElement>(null);

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
      "Food": ["coffee", "restaurant", "lunch", "dinner", "breakfast", "food", "pizza", "burger", "cafe", "bar"],
      "Groceries": ["grocery", "groceries", "supermarket", "walmart", "target", "costco", "produce", "market"],
      "Transport": ["gas", "fuel", "uber", "taxi", "bus", "train", "parking", "lyft", "flight", "metro"],
      "Entertainment": ["movie", "cinema", "netflix", "spotify", "game", "concert", "theater", "streaming"],
      "Health": ["doctor", "pharmacy", "medicine", "hospital", "dental", "prescription", "gym", "fitness"],
      "Utilities": ["electric", "water", "phone", "internet", "cable", "utility", "bill"],
      "Housing": ["rent", "mortgage", "property", "hoa", "maintenance", "repair", "home"],
      "Clothing": ["clothes", "clothing", "shirt", "pants", "shoes", "dress", "fashion"],
      "Insurance": ["insurance", "premium", "coverage", "policy", "auto", "health"],
      "Education": ["school", "book", "course", "tuition", "university", "college", "training"],
      "Tax": ["tax", "taxes", "irs", "filing", "deduction", "refund"],
      "Work": ["office", "supplies", "business", "work", "conference", "equipment"],
      "Donations": ["charity", "donation", "church", "nonprofit", "give", "foundation"]
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
    
    // Validate amount based on type
    const validAmount = type === 'income' ? parseSmartAmount(amount) : parseFloat(amount);
    
    // More specific validation errors
    if (!amount || validAmount <= 0) {
      toast({
        title: "Amount Required",
        description: type === 'income' ? "Please enter a valid amount (e.g., 3.2k, $2,000)" : "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    
    if (!description.trim() && type === 'expense') {
      toast({
        title: "Description Required",
        description: "Please add a description for this expense",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Auto-suggest category if not selected
    const finalCategory = category || suggestCategoryFromDescription(description) || "Other";

    const expense: Omit<Expense, 'id'> = {
      amount: type === 'income' ? parseSmartAmount(amount) : parseFloat(amount),
      description: type === 'income' ? (description.trim() || 'Income') : description.trim(),
      category: type === 'income' ? 'Income' : (category || suggestCategoryFromDescription(description) || "Other"),
      date: new Date(),
      type,
      accountId: accountId || accounts[0]?.id
    };

    // Simulate processing time for better UX
    setTimeout(() => {
      onAddExpense(expense);
      
      // Reset form
      setAmount("");
      setDescription("");
      setCategory("");
      setIsRecurring(false);
      setShowSuggestions(false);
      setIsLoading(false);
      setAiParseSuccess(false);
      
      // Reset AI mode
      setAiInput("");
      
      toast({
        title: type === 'expense' ? "💳 Expense Added" : "💰 Income Added",
        description: `$${validAmount.toLocaleString()} for ${description}`,
        duration: 2000
      });
    }, 300);
  };

  const parseSmartAmount = (value: string): number => {
    // Remove any non-numeric characters except decimal point, k, and m
    const cleanValue = value.toLowerCase().replace(/[^\d.km]/g, '');
    
    if (cleanValue.includes('k')) {
      return parseFloat(cleanValue.replace('k', '')) * 1000;
    }
    if (cleanValue.includes('m')) {
      return parseFloat(cleanValue.replace('m', '')) * 1000000;
    }
    
    return parseFloat(cleanValue) || 0;
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleSmartAmountChange = (value: string) => {
    setAmount(value);
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

  // Auto-focus AI input when component mounts
  useEffect(() => {
    if (aiMode && aiInputRef.current) {
      setTimeout(() => aiInputRef.current?.focus(), 100);
    }
  }, [aiMode]);

  // Real-time enhanced parsing with auto-fill
  const debouncedParse = useCallback(async (input: string) => {
    if (!input.trim()) {
      setAiParseSuccess(false);
      setParsedData(null);
      return;
    }

    setIsParsing(true);

    try {
      // Use enhanced parser
      const parsed = EnhancedExpenseParser.parseExpenseText(input);
      setParsedData(parsed);
      
      // Auto-fill form fields if confidence is decent
      const overallConfidence = EnhancedExpenseParser.getOverallConfidence(parsed.confidence);
      if (overallConfidence > 0.5 && parsed.amount > 0) {
        setAmount(parsed.amount.toString());
        setDescription(parsed.description);
        setCategory(parsed.category);
        setType(parsed.type);
        setAiParseSuccess(true);
        
        // Auto-submit if enabled and high confidence
        if (autoSubmit && overallConfidence > 0.8) {
          setTimeout(() => {
            const form = document.querySelector('form');
            if (form) {
              const submitEvent = new Event('submit', { bubbles: true });
              form.dispatchEvent(submitEvent);
            }
          }, 500);
        }
      }
    } catch (error) {
      console.warn('Enhanced parsing failed:', error);
      setAiParseSuccess(false);
    }
    
    setIsParsing(false);
  }, [categories, autoSubmit]);

  // Debounce the AI parsing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (aiInput && aiMode) {
        debouncedParse(aiInput);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [aiInput, aiMode, debouncedParse]);

  // Handle Enter key in AI input
  const handleAiInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Submit the form if fields are filled
      if (amount && description) {
        setTimeout(() => {
          const form = document.querySelector('form');
          if (form) {
            const submitEvent = new Event('submit', { bubbles: true });
            form.dispatchEvent(submitEvent);
          }
        }, 100);
      }
    }
  };

  return (
    <Card className="border border-border/50 bg-card">
      <CardHeader className="pb-4 border-b border-border/30">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-muted-foreground" />
            Quick Add
            {isLoading && (
              <div className="animate-spin opacity-60">
                <Zap size={16} className="text-primary" />
              </div>
            )}
            {aiParseSuccess && (
              <CheckCircle2 size={16} className="text-green-500" />
            )}
          </div>
          <Button
            type="button"
            variant={aiMode ? "default" : "ghost"}
            size="sm"
            onClick={() => setAiMode(!aiMode)}
            className="flex items-center gap-1 text-sm"
          >
            <Sparkles size={14} />
            AI
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* AI Input Mode */}
        {aiMode && type === 'expense' && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles size={16} className="text-primary" />
                Enhanced AI Parser
                {isParsing && (
                  <div className="animate-spin opacity-60">
                    <Sparkles size={12} className="text-primary" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground">Auto-submit</span>
                  <Switch
                    checked={autoSubmit}
                    onCheckedChange={setAutoSubmit}
                    className="scale-75"
                  />
                </div>
              </div>
            </div>
            <Textarea
              ref={aiInputRef}
              placeholder="Type naturally: 'coffee $5', 'gas 25 bucks', 'lunch at subway 12 dollars' (Press Enter to submit)"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={handleAiInputKeyDown}
              className="min-h-[80px] resize-none"
            />
            
            {/* Parsed Data Display */}
            {parsedData && (
              <div className="mt-2 p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Parsed Data</span>
                  <span className={`text-xs px-2 py-1 rounded border ${EnhancedExpenseParser.getConfidenceColor(
                    EnhancedExpenseParser.getOverallConfidence(parsedData.confidence)
                  )}`}>
                    {Math.round(EnhancedExpenseParser.getOverallConfidence(parsedData.confidence) * 100)}% confidence
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div>Amount: ${parsedData.amount} ({Math.round(parsedData.confidence.amount * 100)}%)</div>
                  <div>Description: {parsedData.description} ({Math.round(parsedData.confidence.description * 100)}%)</div>
                  <div>Category: {parsedData.category} ({Math.round(parsedData.confidence.category * 100)}%)</div>
                  <div>Type: {parsedData.type} ({Math.round(parsedData.confidence.type * 100)}%)</div>
                  {parsedData.merchant && (
                    <div className="text-blue-600">Merchant: {parsedData.merchant}</div>
                  )}
                  {parsedData.reasoning && (
                    <div className="text-muted-foreground">Reasoning: {parsedData.reasoning}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          {(!aiMode || type === 'income') && (
            <div className="flex bg-muted/50 p-1 rounded-md">
              <Button
                type="button"
                variant={type === 'expense' ? 'default' : 'ghost'}
                onClick={() => setType('expense')}
                className={`flex-1 h-8 text-sm ${
                  type === 'expense' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-background'
                }`}
              >
                💳 Expense
              </Button>
              <Button
                type="button"
                variant={type === 'income' ? 'default' : 'ghost'}
                onClick={() => setType('income')}
                className={`flex-1 h-8 text-sm ${
                  type === 'income' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-background'
                }`}
              >
                💰 Income
              </Button>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-3">
            <Input
              type={type === 'income' ? 'text' : 'number'}
              step={type === 'income' ? undefined : '0.01'}
              placeholder={type === 'income' ? '3.2k, $2,000...' : 'Amount'}
              value={amount}
              onChange={(e) => handleSmartAmountChange(e.target.value)}
              className="text-lg font-medium"
              disabled={isLoading}
            />

            {/* Quick Amount Buttons */}
            {type === 'expense' && (
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(quickAmount)}
                    className="h-7 px-2 text-xs"
                  >
                    ${quickAmount}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2 relative">
            <Input
              ref={descriptionRef}
              type="text"
              placeholder={type === 'income' ? "Income source (optional)" : "What did you buy?"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="transition-colors"
            />
            
            {/* Smart Suggestions */}
            {showSuggestions && type === 'expense' && (
              <div className="absolute top-full left-0 right-0 z-50 bg-popover border rounded-md shadow-md max-h-32 overflow-y-auto">
                <div className="p-2 border-b">
                  <span className="text-xs text-muted-foreground">Suggestions</span>
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Selection */}
          {type === 'expense' && (
            <div className="space-y-2">
              {/* Recent Categories */}
              {recentCategories.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">Recent</span>
                  <div className="flex flex-wrap gap-1">
                    {recentCategories.map((recentCat) => (
                      <Button
                        key={recentCat}
                        type="button"
                        variant={category === recentCat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategory(recentCat)}
                        className="h-7 px-2 text-xs"
                      >
                        {recentCat}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Dropdown */}
              <Select value={category} onValueChange={setCategory}>
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
          )}

          {/* Account Selection */}
          {accounts.length > 1 && (
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - ${account.balance.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isLoading || !amount}
              className="flex-1 h-10"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin">
                    <Zap size={16} />
                  </div>
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus size={16} />
                  Add {type === 'expense' ? 'Expense' : 'Income'}
                  {amount && ` ($${parseFloat(amount) || 0})`}
                </div>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 px-3"
              onClick={() => {
                toast({
                  title: "📷 Camera",
                  description: "Photo upload coming soon!",
                  duration: 2000
                });
              }}
            >
              <Camera size={16} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 px-3"
              onClick={() => {
                toast({
                  title: "🧾 Receipt",
                  description: "Receipt scanning coming soon!",
                  duration: 2000
                });
              }}
            >
              <Receipt size={16} />
            </Button>
          </div>

          {/* Make Recurring Option */}
          <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg mt-4">
            <input
              type="checkbox"
              id="makeRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded border-input"
            />
            <label htmlFor="makeRecurring" className="text-sm font-medium cursor-pointer">
              Make this recurring
            </label>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};