import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Camera, Receipt, Zap, Sparkles, CheckCircle2, Bot, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Expense, Account } from '@/types/app';
import { EXPENSE_CATEGORIES, suggestCategoryFromDescription as getCategorySuggestion } from '@/utils/categories';
import { getSmartSuggestions } from '@/utils/smartSuggestions';
import { EnhancedExpenseParser, type ParsedExpense } from "@/utils/enhancedExpenseParser";
import { supabase } from "@/integrations/supabase/client";
import { ReceiptScanner } from "@/components/ReceiptScanner";
import { BankStatementUploader } from "@/components/BankStatementUploader";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
interface QuickAddExpenseProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  existingExpenses: Expense[];
  accounts: Account[];
  editingExpense?: Expense;
}

const quickAmounts = [5, 10, 15, 20, 25, 50];

export const EnhancedQuickAddExpense = ({ onAddExpense, existingExpenses, accounts, editingExpense }: QuickAddExpenseProps) => {
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
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [aiParseSuccess, setAiParseSuccess] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedExpense | null>(null);
  const [useFallback, setUseFallback] = useState(true);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [showStatementUploader, setShowStatementUploader] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const { toast } = useToast();
  const descriptionRef = useRef<HTMLInputElement>(null);
  const aiInputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save internals (robust consecutive saves)
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef<Omit<Expense, 'id'> | null>(null);
  const latestDraftRef = useRef<{ amount: string; description: string; category: string; type: 'expense' | 'income'; accountId: string; } | null>(null);
  const lastSavedHashRef = useRef<string | null>(null);

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


  // Auto-suggest category based on description (delegated to centralized function)
  const suggestCategoryFromDescription = (desc: string): string => {
    return getCategorySuggestion(desc);
  };

  // Auto-logging with debounced queue and duplicate prevention
  const buildDraft = useCallback((): Omit<Expense, 'id'> | null => {
    const validAmount = type === 'income' ? parseSmartAmount(amount) : parseFloat(amount);
    const hasValidData = validAmount > 0 && (description.trim() || type === 'income');
    if (!hasValidData) return null;

    const finalCategory = type === 'income'
      ? 'Income'
      : (category || suggestCategoryFromDescription(description) || 'Other');

    return {
      amount: validAmount,
      description: type === 'income' ? (description.trim() || 'Income') : description.trim(),
      category: finalCategory,
      date: new Date(),
      type,
      accountId: accountId || accounts[0]?.id
    };
  }, [amount, description, category, type, accountId, accounts]);

  const hashDraft = (exp: Omit<Expense, 'id'>) =>
    JSON.stringify({ a: exp.amount, d: exp.description, c: exp.category, t: exp.type, acc: exp.accountId });

  const flushQueue = useCallback(() => {
    // Process pending save if exists and differs from last saved
    const next = pendingSaveRef.current;
    if (!next) return;
    pendingSaveRef.current = null;
    enqueueSave(next);
  }, []);

  const enqueueSave = useCallback((draft?: Omit<Expense, 'id'> | null) => {
    if (editingExpense) return; // disable auto-save in edit mode
    const exp = draft ?? buildDraft();
    if (!exp || !autoSubmit) return;

    const currentHash = hashDraft(exp);
    if (lastSavedHashRef.current === currentHash) {
      return; // duplicate
    }

    if (isSavingRef.current) {
      // queue latest
      pendingSaveRef.current = exp;
      return;
    }

    isSavingRef.current = true;

    try {
      onAddExpense(exp);
      lastSavedHashRef.current = currentHash;

      // Reset form if not editing
      if (!editingExpense) {
        setAmount("");
        setDescription("");
        setCategory("");
        setIsRecurring(false);
        setShowSuggestions(false);
        setAiInput("");
      }
      setAiParseSuccess(false);

      toast({
        title: exp.type === 'expense' ? "💳 Expense Auto-Logged" : "💰 Income Auto-Logged",
        description: `$${exp.amount.toLocaleString()} for ${exp.description || 'Income'}`,
        duration: 2000
      });
    } finally {
      // small cooldown to mimic previous UX
      setTimeout(() => {
        isSavingRef.current = false;
        flushQueue();
      }, 300);
    }
  }, [autoSubmit, buildDraft, editingExpense, onAddExpense, toast]);

  // Debounced trigger
  const triggerAutoSave = useCallback(() => {
    latestDraftRef.current = { amount, description, category, type, accountId } as any;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      enqueueSave(buildDraft());
    }, 600);
  }, [amount, description, category, type, accountId, buildDraft, enqueueSave]);

  // Immediate save on blur (disabled in edit mode)
  const handleFieldBlur = useCallback(() => {
    if (editingExpense) return;
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
    enqueueSave(buildDraft());
  }, [buildDraft, enqueueSave, editingExpense]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
    };
  }, []);

  // Trigger auto-save when form fields change
  useEffect(() => {
    if (!editingExpense && (amount || description)) {
      triggerAutoSave();
    }
  }, [amount, description, category, triggerAutoSave, editingExpense]);

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
    
    // Build expense payload first
    const expense: Omit<Expense, 'id'> = {
      amount: type === 'income' ? parseSmartAmount(amount) : parseFloat(amount),
      description: type === 'income' ? (description.trim() || 'Income') : description.trim(),
      category: type === 'income' ? 'Income' : (category || suggestCategoryFromDescription(description) || "Other"),
      date: new Date(),
      type,
      accountId: accountId || accounts[0]?.id
    };

    // Prevent duplicate submissions and queue if needed
    const manualHash = JSON.stringify({ a: expense.amount, d: expense.description, c: expense.category, t: expense.type, acc: expense.accountId });
    if (!editingExpense && lastSavedHashRef.current === manualHash) {
      setIsLoading(false);
      return;
    }
    if (!editingExpense && isSavingRef.current) {
      pendingSaveRef.current = expense;
      setIsLoading(false);
      return;
    }
    // Simulate processing time for better UX
    setTimeout(() => {
      onAddExpense(expense);
      lastSavedHashRef.current = manualHash;
      
      // Reset form only if not editing
      if (!editingExpense) {
        setAmount("");
        setDescription("");
        setCategory("");
        setIsRecurring(false);
        setShowSuggestions(false);
        setAiInput("");
      }
      setIsLoading(false);
      setAiParseSuccess(false);
      
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
    triggerAutoSave();
  };

  const handleSmartAmountChange = (value: string) => {
    setAmount(value);
    triggerAutoSave();
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
    triggerAutoSave();
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

  // Pre-fill form when editing
  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setDescription(editingExpense.description);
      setCategory(editingExpense.category);
      setType(editingExpense.type);
      setAccountId(editingExpense.accountId || accounts[0]?.id || "");
      // Disable AI and auto-save when editing
      setAiMode(false);
      setAutoSubmit(false);
      lastSavedHashRef.current = null;
    }
  }, [editingExpense, accounts]);

  // Auto-focus AI input when component mounts
  useEffect(() => {
    if (aiMode && aiInputRef.current && !editingExpense) {
      setTimeout(() => aiInputRef.current?.focus(), 100);
    }
  }, [aiMode, editingExpense]);

  // OpenAI fallback for category re-classification
  const tryFallbackParsing = async (text: string, localCategory: string, localConfidence: number) => {
    if (!useFallback) return null;
    
    setIsUsingFallback(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('parse-expense-fallback', {
        body: {
          text,
          localCategory,
          localConfidence
        }
      });

      if (error) {
        console.error('Fallback parsing error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Fallback parsing failed:', error);
      return null;
    } finally {
      setIsUsingFallback(false);
    }
  };

  // Real-time enhanced parsing with auto-fill and fallback
  const debouncedParse = useCallback(async (input: string) => {
    if (!input.trim()) {
      setAiParseSuccess(false);
      setParsedData(null);
      return;
    }

    setIsParsing(true);

    try {
      // Use enhanced parser first
      const parsed = EnhancedExpenseParser.parseExpenseText(input);
      let finalParsed = { ...parsed };
      
      // Check if we should use OpenAI fallback for category
      const overallConfidence = EnhancedExpenseParser.getOverallConfidence(parsed.confidence);
      if (parsed.category === 'Other' && parsed.confidence.category < 0.6 && useFallback) {
        const fallbackResult = await tryFallbackParsing(input, parsed.category, parsed.confidence.category);
        
        if (fallbackResult?.shouldUpdate && fallbackResult.suggestedCategory !== 'Other') {
          finalParsed.category = fallbackResult.suggestedCategory;
          finalParsed.confidence.category = fallbackResult.confidence;
          finalParsed.reasoning = `Local: ${parsed.reasoning || 'Basic parsing'} | AI: ${fallbackResult.reasoning}`;
        }
      }
      
      setParsedData(finalParsed);
      
      // Auto-fill form fields if confidence is decent
      const finalConfidence = EnhancedExpenseParser.getOverallConfidence(finalParsed.confidence);
      if (finalConfidence > 0.5 && finalParsed.amount > 0) {
        setAmount(finalParsed.amount.toString());
        setDescription(finalParsed.description);
        setCategory(finalParsed.category);
        setType(finalParsed.type);
        setAiParseSuccess(true);
        
        // Auto-submit if enabled and high confidence
        if (autoSubmit && finalConfidence > 0.8) {
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
  }, [autoSubmit, useFallback]);

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

  const handleBulkTransactions = (transactions: Omit<Expense, 'id'>[]) => {
    // Add all transactions
    transactions.forEach(transaction => {
      onAddExpense(transaction);
    });
    setShowStatementUploader(false);
  };

  const isMobile = useIsMobile();

  return (
    <div className="h-full bg-background">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold">{editingExpense ? 'Edit Transaction' : 'Quick Add'}</div>
          {isLoading && (
            <div className="animate-spin opacity-60">
              <Zap size={16} className="text-primary" />
            </div>
          )}
          {aiParseSuccess && (
            <CheckCircle2 size={16} className="text-green-500" />
          )}
        </div>
        {!editingExpense && (
          <Button
            type="button"
            variant={aiMode ? "default" : "ghost"}
            size="sm"
            onClick={() => setAiMode(!aiMode)}
            className="flex items-center gap-1"
          >
            <Sparkles size={14} />
            AI
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* AI Input Mode */}
        {aiMode && type === 'expense' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles size={16} className="text-primary" />
                AI Parser
                {isParsing && (
                  <div className="animate-spin opacity-60">
                    <Sparkles size={12} className="text-primary" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground">Smart AI</span>
                  <Switch
                    checked={useFallback}
                    onCheckedChange={setUseFallback}
                    className="scale-75"
                  />
                </div>
                {!editingExpense && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-muted-foreground">Quick Save</span>
                    <Switch
                      checked={autoSubmit}
                      onCheckedChange={setAutoSubmit}
                      className="scale-75"
                    />
                  </div>
                )}
              </div>
            </div>
            <Textarea
              ref={aiInputRef}
              placeholder="Say it naturally: 'coffee $5' or 'gas 25 bucks'"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={handleAiInputKeyDown}
              className="min-h-[60px] resize-none text-base"
            />
            
            {/* Parsed Data Display - Compact */}
            {parsedData && (
              <div className="p-3 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">AI Parsed</span>
                  <span className={`text-xs px-2 py-1 rounded ${EnhancedExpenseParser.getConfidenceColor(
                    EnhancedExpenseParser.getOverallConfidence(parsedData.confidence)
                  )}`}>
                    {Math.round(EnhancedExpenseParser.getOverallConfidence(parsedData.confidence) * 100)}%
                  </span>
                  {isUsingFallback && (
                    <Bot className="h-3 w-3 text-blue-600" />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Amount: ${parsedData.amount}</div>
                  <div>Type: {parsedData.type}</div>
                  <div className="col-span-2">Description: {parsedData.description}</div>
                  <div className="col-span-2">Category: {parsedData.category}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle - Always Visible for Better Income Access */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={type === 'expense' ? 'default' : 'outline'}
              onClick={() => setType('expense')}
              className={`h-12 text-sm font-medium flex items-center gap-2 ${
                type === 'expense' 
                  ? 'bg-expense text-expense-foreground shadow-md' 
                  : 'border-dashed hover:bg-muted/50'
              }`}
            >
              💳 <span>Expense</span>
            </Button>
            <Button
              type="button"
              variant={type === 'income' ? 'default' : 'outline'}
              onClick={() => setType('income')}
              className={`h-12 text-sm font-medium flex items-center gap-2 ${
                type === 'income' 
                  ? 'bg-income text-income-foreground shadow-md' 
                  : 'border-dashed hover:bg-muted/50'
              }`}
            >
              💰 <span>Income</span>
            </Button>
          </div>

          {/* Amount Input - Large and Prominent */}
          <div className="space-y-3">
            <div className="relative">
              <Input
                type={type === 'income' ? 'text' : 'number'}
                step={type === 'income' ? undefined : '0.01'}
                placeholder={type === 'income' ? '3.2k, $2,000...' : '0.00'}
                value={amount}
                onChange={(e) => handleSmartAmountChange(e.target.value)}
                onBlur={handleFieldBlur}
                className="text-2xl font-bold h-16 pl-8 text-center"
                disabled={isLoading}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
                $
              </div>
              {/* Camera, Receipt, and Statement buttons inline */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowReceiptScanner(true)}
                  disabled={isLoading}
                >
                  <Camera size={16} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowReceiptScanner(true)}
                  disabled={isLoading}
                >
                  <Receipt size={16} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowStatementUploader(true)}
                  disabled={isLoading}
                >
                  <FileText size={16} />
                </Button>
              </div>
            </div>

            {/* Quick Amount Buttons - Mobile Grid */}
            {type === 'expense' && (
              <div className="grid grid-cols-6 gap-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(quickAmount)}
                    className="h-8 text-xs"
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
              onBlur={handleFieldBlur}
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

          {/* Category Selection - Grid Layout */}
          {type === 'expense' && (
            <div className="space-y-3">
              {/* Recent Categories */}
              {recentCategories.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Recently Used</span>
                  <div className="flex gap-2">
                    {recentCategories.map((recentCat) => (
                      <Button
                        key={recentCat}
                        type="button"
                        variant={category === recentCat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategory(recentCat)}
                        className="h-8 px-3 text-xs flex-1"
                      >
                        {recentCat}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Grid */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Categories</span>
                <div className="grid grid-cols-3 gap-2">
                  {EXPENSE_CATEGORIES.slice(0, 9).map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant={category === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategory(cat)}
                      className="h-10 text-xs"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
                
                {/* More Categories Dropdown */}
                {EXPENSE_CATEGORIES.length > 9 && (
                  <Select 
                    value={category && !EXPENSE_CATEGORIES.slice(0, 9).includes(category as any) ? category : ""} 
                    onValueChange={setCategory}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="More categories..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.slice(9).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}

          {/* Account Selection */}
          {accounts.length > 1 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Account</span>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="h-10">
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
            </div>
          )}

          {/* Make Recurring Option - Compact */}
          {type === 'expense' && (
            <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
              <input
                type="checkbox"
                id="makeRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="makeRecurring" className="text-sm cursor-pointer flex-1">
                Make this recurring
              </label>
            </div>
          )}

          {/* Action Button - Full Width */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading || !amount}
              className="w-full h-12 text-base font-medium"
              variant={type === 'expense' ? 'expense' : 'income'}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin">
                    <Zap size={18} />
                  </div>
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus size={18} />
                  {editingExpense ? 'Update' : 'Add'} {type === 'expense' ? 'Expense' : 'Income'}
                  {amount && ` • $${parseFloat(amount) || 0}`}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
      
      {/* Receipt Scanner Dialog */}
      <Dialog open={showReceiptScanner} onOpenChange={setShowReceiptScanner}>
        <DialogContent className="sm:max-w-2xl" aria-labelledby="receipt-scanner-title" aria-describedby="receipt-scanner-desc">
          <DialogHeader>
            <DialogTitle id="receipt-scanner-title">Receipt Scanner</DialogTitle>
            <DialogDescription id="receipt-scanner-desc">Capture or upload a receipt to extract expense details.</DialogDescription>
          </DialogHeader>
          <ReceiptScanner
            onExpenseExtracted={(expenseData) => {
              // Fill the form with extracted data
              setAmount(expenseData.amount.toString());
              setDescription(expenseData.description);
              setCategory(expenseData.category);
              setType(expenseData.type);
              
              // Auto-submit if confidence is high and auto-submit is enabled
              const avgConfidence = (
                expenseData.confidence.amount +
                expenseData.confidence.description +
                expenseData.confidence.category
              ) / 3;
              
              setShowReceiptScanner(false);
              
              if (autoSubmit && avgConfidence > 0.8) {
                // Use setTimeout to allow state updates to complete
                setTimeout(() => {
                  const formEvent = new Event('submit', { bubbles: true, cancelable: true });
                  document.querySelector('form')?.dispatchEvent(formEvent);
                }, 100);
              }
            }}
            onClose={() => setShowReceiptScanner(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Bank Statement Uploader */}
      <BankStatementUploader
        isOpen={showStatementUploader}
        onClose={() => setShowStatementUploader(false)}
        onTransactionsAdded={handleBulkTransactions}
      />
    </div>
  );
};