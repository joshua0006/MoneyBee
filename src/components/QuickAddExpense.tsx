import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Camera, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'expense' | 'income';
}

interface QuickAddExpenseProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

import { EXPENSE_CATEGORIES } from '@/utils/categories';

const quickAmounts = [5, 10, 15, 20, 25, 50];

export const QuickAddExpense = ({ onAddExpense }: QuickAddExpenseProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const expense: Omit<Expense, 'id'> = {
      amount: parseFloat(amount),
      description,
      category,
      date: new Date(),
      type
    };

    onAddExpense(expense);
    
    // Reset form
    setAmount("");
    setDescription("");
    setCategory("");
    
    toast({
      title: type === 'expense' ? "Expense Added" : "Income Added",
      description: `$${amount} for ${description}`,
      duration: 2000
    });
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  return (
    <Card className="shadow-soft border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus size={20} />
          Quick Add
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === 'expense' ? 'expense' : 'outline'}
              className="flex-1"
              onClick={() => setType('expense')}
            >
              Expense
            </Button>
            <Button
              type="button"
              variant={type === 'income' ? 'income' : 'outline'}
              className="flex-1"
              onClick={() => setType('income')}
            >
              Income
            </Button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
              />
            </div>
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
                className="text-xs"
              >
                ${quickAmount}
              </Button>
            ))}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
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
              className="flex-1"
            >
              <Plus size={16} />
              Add {type === 'expense' ? 'Expense' : 'Income'}
            </Button>
            <Button type="button" variant="outline" size="icon">
              <Camera size={16} />
            </Button>
            <Button type="button" variant="outline" size="icon">
              <Receipt size={16} />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};