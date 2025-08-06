import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Calendar, X } from "lucide-react";
import { formatDistanceToNow, isWithinInterval, startOfDay, endOfDay } from "date-fns";

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'expense' | 'income';
}

interface SearchAndFilterProps {
  expenses: Expense[];
  onFilteredResults: (filtered: Expense[]) => void;
  onExport: () => void;
}

import { getCategoriesForFilter } from '@/utils/categories';

const dateRanges = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Last 30 Days", value: "30days" },
];

export const SearchAndFilter = ({ expenses, onFilteredResults, onExport }: SearchAndFilterProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let filtered = [...expenses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(expense => expense.type === selectedType);
    }

    // Date range filter
    if (selectedDateRange !== "all") {
      const now = new Date();
      const today = startOfDay(now);
      
      switch (selectedDateRange) {
        case "today":
          filtered = filtered.filter(expense => 
            isWithinInterval(expense.date, { start: today, end: endOfDay(now) })
          );
          break;
        case "week":
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
          filtered = filtered.filter(expense => 
            isWithinInterval(expense.date, { start: startOfDay(weekStart), end: endOfDay(new Date()) })
          );
          break;
        case "month":
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          filtered = filtered.filter(expense => 
            isWithinInterval(expense.date, { start: monthStart, end: endOfDay(new Date()) })
          );
          break;
        case "30days":
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(expense => 
            isWithinInterval(expense.date, { start: thirtyDaysAgo, end: endOfDay(new Date()) })
          );
          break;
      }
    }

    onFilteredResults(filtered);
  }, [searchTerm, selectedCategory, selectedDateRange, selectedType, expenses, onFilteredResults]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All Categories");
    setSelectedDateRange("all");
    setSelectedType('all');
    setShowFilters(false);
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "All Categories" || 
                          selectedDateRange !== "all" || selectedType !== 'all';

  return (
    <Card className="shadow-soft border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Search & Filter</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              {hasActiveFilters && <Badge variant="secondary" className="ml-1 h-4 w-4 p-0">!</Badge>}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="flex items-center gap-2"
            >
              <Download size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X size={14} />
            </Button>
          )}
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="space-y-3 pt-2 border-t">
            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={selectedType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('all')}
                  className="flex-1"
                >
                  All
                </Button>
                <Button
                  type="button"
                  variant={selectedType === 'expense' ? 'expense' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('expense')}
                  className="flex-1"
                >
                  Expenses
                </Button>
                <Button
                  type="button"
                  variant={selectedType === 'income' ? 'income' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('income')}
                  className="flex-1"
                >
                  Income
                </Button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {range.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full mt-3"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {searchTerm && (
              <Badge variant="secondary">
                Search: "{searchTerm}"
              </Badge>
            )}
            {selectedCategory !== "All Categories" && (
              <Badge variant="secondary">
                {selectedCategory}
              </Badge>
            )}
            {selectedDateRange !== "all" && (
              <Badge variant="secondary">
                {dateRanges.find(r => r.value === selectedDateRange)?.label}
              </Badge>
            )}
            {selectedType !== 'all' && (
              <Badge variant="secondary">
                {selectedType === 'expense' ? 'Expenses' : 'Income'}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};