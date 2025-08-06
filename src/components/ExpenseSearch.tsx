import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, Calendar, DollarSign, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Expense } from '@/types/app';

interface ExpenseSearchProps {
  expenses: Expense[];
  onFilteredResults: (filtered: Expense[]) => void;
  categories?: string[];
}

export const ExpenseSearch: React.FC<ExpenseSearchProps> = ({
  expenses,
  onFilteredResults,
  categories = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [amountRange, setAmountRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Get unique categories from expenses if not provided
  const availableCategories = useMemo(() => {
    if (categories.length > 0) return categories;
    return [...new Set(expenses.map(e => e.category))].sort();
  }, [expenses, categories]);

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter(expense => {
      // Text search
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          expense.description.toLowerCase().includes(searchLower) ||
          expense.category.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && expense.category !== selectedCategory) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && expense.type !== selectedType) {
        return false;
      }

      // Amount range filter
      if (amountRange.min && expense.amount < parseFloat(amountRange.min)) {
        return false;
      }
      if (amountRange.max && expense.amount > parseFloat(amountRange.max)) {
        return false;
      }

      // Date range filter
      if (dateRange.from || dateRange.to) {
        const expenseDate = new Date(expense.date);
        if (dateRange.from && expenseDate < dateRange.from) {
          return false;
        }
        if (dateRange.to && expenseDate > dateRange.to) {
          return false;
        }
      }

      return true;
    });

    // Sort expenses
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [expenses, searchQuery, sortBy, sortOrder, selectedCategory, selectedType, amountRange, dateRange]);

  // Update parent component when filters change
  React.useEffect(() => {
    onFilteredResults(filteredExpenses);
  }, [filteredExpenses, onFilteredResults]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedType('all');
    setAmountRange({ min: '', max: '' });
    setDateRange({});
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory !== 'all' ? selectedCategory : null,
    selectedType !== 'all' ? selectedType : null,
    amountRange.min,
    amountRange.max,
    dateRange.from,
    dateRange.to
  ].filter(Boolean).length;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-auto min-w-[120px]">
              <Tag className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {availableCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-auto min-w-[120px]">
              <DollarSign className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>

          {/* Advanced Filters */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 space-y-4">
              <h4 className="font-medium text-sm">Advanced Filters</h4>
              
              {/* Amount Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount Range</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={amountRange.min}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={amountRange.max}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </PopoverContent>
          </Popover>

          {/* Sort Controls */}
          <div className="flex gap-1">
            <Select value={sortBy} onValueChange={(value: 'date' | 'amount' | 'category') => setSortBy(value)}>
              <SelectTrigger className="w-auto min-w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        {filteredExpenses.length !== expenses.length && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredExpenses.length} of {expenses.length} expenses
            {activeFiltersCount > 0 && (
              <Button
                variant="link"
                size="sm"
                onClick={clearFilters}
                className="h-auto p-0 ml-2 text-primary"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};