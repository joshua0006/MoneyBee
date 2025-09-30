import { useAppData } from "@/contexts/AppDataContext";
import { EnhancedQuickAddExpense } from "@/components/EnhancedQuickAddExpense";
import { useToast } from "@/hooks/use-toast";
import { mobileService } from "@/utils/mobileService";
import type { Expense } from "@/types/app";

interface GlobalExpenseFormProps {
  onClose: () => void;
}

export const GlobalExpenseForm = ({ onClose }: GlobalExpenseFormProps) => {
  const { expenses, accounts, addExpense } = useAppData();
  const { toast } = useToast();

  const handleAddExpense = async (expense: Omit<Expense, 'id'>) => {
    await addExpense(expense);
    mobileService.successHaptic();
    onClose();
    toast({
      title: "✅ Transaction Added",
      description: `${expense.type === 'income' ? 'Income' : 'Expense'} of $${expense.amount} recorded`,
      duration: 3000
    });
  };

  return (
    <EnhancedQuickAddExpense
      onAddExpense={handleAddExpense}
      existingExpenses={expenses || []}
      accounts={accounts || []}
    />
  );
};