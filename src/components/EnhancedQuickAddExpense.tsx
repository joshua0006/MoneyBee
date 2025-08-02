import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Camera, Receipt, Zap, Sparkles, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSmartSuggestions, type Expense, type Account } from "@/utils/expenseUtils";
import { AIExpenseParser, type ParsedExpense } from "@/utils/aiExpenseParser";
import { OpenAIExpenseParser, type OpenAIParsedExpense } from "@/utils/openaiExpenseParser";

interface QuickAddExpenseProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  existingExpenses: Expense[];
  accounts: Account[];
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

export const EnhancedQuickAddExpense = ({ onAddExpense, existingExpenses, accounts }: QuickAddExpenseProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // AI Recognition states
  const [aiMode, setAiMode] = useState(true);
  const [aiInput, setAiInput] = useState("");
  const [parsedExpense, setParsedExpense] = useState<ParsedExpense | null>(null);
  const [openaiParsedExpense, setOpenaiParsedExpense] = useState<OpenAIParsedExpense | null>(null);
  const [showAiPreview, setShowAiPreview] = useState(false);
  const [isParsingWithOpenAI, setIsParsingWithOpenAI] = useState(false);
  const [useOpenAI, setUseOpenAI] = useState(OpenAIExpenseParser.isAvailable());
  
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
      setShowSuggestions(false);
      setIsLoading(false);
      
      // Reset AI mode
      setAiInput("");
      setParsedExpense(null);
      setShowAiPreview(false);
      
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
    // Show parsed amount in real-time for income
    if (type === 'income' && value) {
      const parsed = parseSmartAmount(value);
      if (parsed > 0 && parsed !== parseFloat(value)) {
        // Show a subtle indicator of the parsed amount
        setTimeout(() => {
          const input = document.querySelector('input[type="number"]') as HTMLInputElement;
          if (input) {
            input.setAttribute('data-parsed', `$${parsed.toLocaleString()}`);
          }
        }, 100);
      }
    }
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

  // Real-time AI parsing with debouncing
  const debouncedParse = useCallback(async (input: string) => {
    if (!input.trim()) {
      setParsedExpense(null);
      setOpenaiParsedExpense(null);
      setShowAiPreview(false);
      return;
    }

    setIsParsingWithOpenAI(true);

    try {
      // Try OpenAI first if available
      if (useOpenAI && OpenAIExpenseParser.isAvailable()) {
        const openaiParsed = await OpenAIExpenseParser.parseExpenseText(input, categories);
        if (openaiParsed) {
          setOpenaiParsedExpense(openaiParsed);
          setShowAiPreview(true);
          
          // Auto-accept if high confidence
          const overallConfidence = OpenAIExpenseParser.getOverallConfidence(openaiParsed.confidence);
          if (overallConfidence > 0.7 && openaiParsed.amount > 0) {
            setAmount(openaiParsed.amount.toString());
            setDescription(openaiParsed.description);
            setCategory(openaiParsed.category);
            setType(openaiParsed.type);
          }
          setIsParsingWithOpenAI(false);
          return;
        }
      }
    } catch (error) {
      console.warn('OpenAI parsing failed, falling back to basic parser:', error);
      toast({
        title: "AI parsing failed",
        description: "Using basic parser instead",
        variant: "destructive",
      });
    }

    // Fallback to basic parser
    const parsed = AIExpenseParser.parseExpenseText(input);
    setParsedExpense(parsed);
    setShowAiPreview(true);
    
    // Auto-accept if decent confidence (amount > 50% and has valid amount)
    if (parsed.confidence.amount > 0.5 && parsed.amount > 0) {
      setAmount(parsed.amount.toString());
      setDescription(parsed.description);
      setCategory(parsed.category);
    }
    
    setIsParsingWithOpenAI(false);
  }, [useOpenAI, categories, toast]);

  // Debounce the AI parsing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (aiInput && aiMode) {
        debouncedParse(aiInput);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [aiInput, aiMode, debouncedParse]);

  // AI Parsing Functions
  const handleAiParse = () => {
    if (!aiInput.trim()) {
      toast({
        title: "No input to parse",
        description: "Please enter some text to parse",
        variant: "destructive"
      });
      return;
    }

    const parsed = AIExpenseParser.parseExpenseText(aiInput);
    setParsedExpense(parsed);
    setShowAiPreview(true);
  };

  const handleAcceptAiParsing = () => {
    const expense = openaiParsedExpense || parsedExpense;
    if (!expense) return;
    
    setAmount(expense.amount.toString());
    setDescription(expense.description);
    setCategory(expense.category);
    setType(expense.type);
    setAiInput("");
    setParsedExpense(null);
    setOpenaiParsedExpense(null);
    setShowAiPreview(false);
    
    toast({
      title: "✨ AI parsing applied",
      description: "Ready to submit",
      duration: 2000
    });
  };

  const handleAiInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      const expense = openaiParsedExpense || parsedExpense;
      if (expense && expense.amount > 0) {
        // Auto-accept the parsing
        setAmount(expense.amount.toString());
        setDescription(expense.description);
        setCategory(expense.category);
        setType(expense.type);
        
        // Clear AI input
        setAiInput("");
        setParsedExpense(null);
        setOpenaiParsedExpense(null);
        setShowAiPreview(false);
        
        // Submit the form
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

  const handleRejectAiParsing = () => {
    setParsedExpense(null);
    setOpenaiParsedExpense(null);
    setShowAiPreview(false);
  };

  const getConfidenceBadge = (confidence: number, field: string) => {
    const level = openaiParsedExpense 
      ? OpenAIExpenseParser.getConfidenceLevel(confidence)
      : AIExpenseParser.getConfidenceLevel(confidence);
    const color = level === 'high' ? 'bg-green-500' : level === 'medium' ? 'bg-yellow-500' : 'bg-red-500';
    
    return (
      <Badge variant="outline" className={`text-xs ${color} text-white border-none`}>
        {field}: {Math.round(confidence * 100)}%
      </Badge>
    );
  };

  return (
    <Card className="shadow-soft border-0 overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-background to-muted/30">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-primary/10 rounded-full">
              <Plus size={16} className="text-primary" />
            </div>
            Quick Add
            {isLoading && (
              <div className="animate-spin">
                <Zap size={16} className="text-primary" />
              </div>
            )}
          </div>
          <Button
            type="button"
            variant={aiMode ? "default" : "outline"}
            size="sm"
            onClick={() => setAiMode(!aiMode)}
            className="flex items-center gap-1"
          >
            <Sparkles size={14} />
            AI
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* AI Input Mode - Primary Interface */}
        {aiMode && type === 'expense' && (
          <div className="space-y-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  <span className="font-medium">
                    {OpenAIExpenseParser.isAvailable() ? "AI-Powered Parser" : "Basic Parser"}
                  </span>
                  {isParsingWithOpenAI && (
                    <div className="animate-spin">
                      <Sparkles size={14} className="text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {OpenAIExpenseParser.isAvailable() && (
                    <Button
                      type="button"
                      variant={useOpenAI ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseOpenAI(!useOpenAI)}
                      className="text-xs"
                    >
                      {useOpenAI ? "🤖 OpenAI" : "⚡ Basic"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => setAiMode(false)}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    Manual Entry
                  </Button>
                </div>
              </div>
              <Textarea
                ref={aiInputRef}
                placeholder="Try: 'coffee 5 bucks', 'gas $25', 'lunch at subway 12 dollars' (Press Enter to add)"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={handleAiInputKeyDown}
                className="min-h-[100px] text-base bg-gradient-to-br from-background to-muted/20 border-primary/20 focus:border-primary/40 transition-all duration-200"
              />
            </div>

            {/* Real-time AI Preview */}
            {showAiPreview && (openaiParsedExpense || parsedExpense) && (openaiParsedExpense?.amount > 0 || parsedExpense?.amount > 0) && (
              <div className="space-y-3 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20 animate-in slide-in-from-top-5 duration-300">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Sparkles size={14} className="text-primary animate-pulse" />
                     <span className="text-sm font-medium">
                       {openaiParsedExpense ? "🤖 OpenAI Parsed" : "⚡ Basic Parsed"}
                     </span>
                   </div>
                    <div className="flex gap-1">
                      {(() => {
                        const expense = openaiParsedExpense || parsedExpense;
                        return expense ? (
                          <>
                            {getConfidenceBadge(expense.confidence.amount, "Amount")}
                            {getConfidenceBadge(expense.confidence.type, "Type")}
                            {getConfidenceBadge(expense.confidence.category, "Category")}
                          </>
                        ) : null;
                      })()}
                    </div>
                 </div>
                  {(() => {
                    const expense = openaiParsedExpense || parsedExpense;
                    return expense ? (
                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div className="space-y-1">
                          <span className="text-muted-foreground text-xs">Amount</span>
                          <div className="font-semibold text-lg text-primary">${expense.amount}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground text-xs">Type</span>
                          <div className="font-medium">{expense.type === 'income' ? '💰 Income' : '💳 Expense'}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground text-xs">Description</span>
                          <div className="font-medium">{expense.description}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground text-xs">Category</span>
                          <div className="font-medium">{expense.category}</div>
                        </div>
                      </div>
                    ) : null;
                  })()} 
                  {openaiParsedExpense?.merchant && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Merchant:</span> {openaiParsedExpense.merchant}
                    </div>
                  )}
                  {openaiParsedExpense?.reasoning && (
                    <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
                      <span className="font-medium">AI Reasoning:</span> {openaiParsedExpense.reasoning}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2 text-center">
                    Press <kbd className="px-1 py-0.5 bg-background rounded text-xs font-mono">Enter</kbd> to add this {(openaiParsedExpense || parsedExpense)?.type}
                  </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Entry Form or Always Show Form */}
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
                type={type === 'income' ? 'text' : 'number'}
                step={type === 'income' ? undefined : '0.01'}
                placeholder={type === 'income' ? '3.2k, $2,000, 5000...' : '0.00'}
                value={amount}
                onChange={(e) => handleSmartAmountChange(e.target.value)}
                className="pl-8 text-lg font-semibold"
                disabled={isLoading}
              />
              {type === 'income' && amount && parseSmartAmount(amount) !== parseFloat(amount) && parseSmartAmount(amount) > 0 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-primary font-medium">
                  ${parseSmartAmount(amount).toLocaleString()}
                </div>
              )}
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

          {/* Description with Smart Suggestions - Only for Expenses */}
          {type === 'expense' && (
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
          )}

          {/* Optional Description for Income */}
          {type === 'income' && (
            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-muted-foreground">Description (Optional)</label>
              <Input
                ref={descriptionRef}
                placeholder="Salary, bonus, freelance... (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="transition-all duration-200"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Category with Smart Suggestions - Only for Expenses */}
          {type === 'expense' && (
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
          )}

          {/* Account Selection */}
          {accounts.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Account</label>
              <Select value={accountId} onValueChange={setAccountId} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: account.color }}
                        />
                        {account.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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