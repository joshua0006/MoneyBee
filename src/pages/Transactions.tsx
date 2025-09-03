import { useState } from "react";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ExpenseList } from "@/components/ExpenseList";
import { useAppData } from "@/hooks/useAppData";
import { EnhancedQuickAddExpense } from "@/components/EnhancedQuickAddExpense";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { mobileService } from "@/utils/mobileService";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet-async";

export default function Transactions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { expenses, accounts, addExpense, updateExpense, deleteExpense } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddExpense = async (expense) => {
    await addExpense(expense);
    setIsAddExpenseOpen(false);
    toast({
      title: "✅ Transaction Added",
      description: `${expense.type === 'income' ? 'Income' : 'Expense'} of $${expense.amount} added`,
    });
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
  };

  const handleUpdateExpense = async (updatedExpense) => {
    if (!editingExpense) return;
    await updateExpense(editingExpense.id, updatedExpense);
    setEditingExpense(null);
    toast({
      title: "✅ Transaction Updated",
      description: `Transaction updated successfully`,
    });
  };

  const handleDeleteExpense = async (id) => {
    await deleteExpense(id);
    toast({
      title: "🗑️ Transaction Deleted",
      description: "Transaction has been removed",
    });
  };

  return (
    <>
      <Helmet>
        <title>Transactions - MoneyBee</title>
        <meta name="description" content="View and manage all your financial transactions in one place" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                mobileService.lightHaptic();
                navigate(-1);
              }}
              className="p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-semibold">Transactions</h1>
            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  mobileService.lightHaptic();
                  setIsAddExpenseOpen(true);
                }}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <ExpenseList
            expenses={filteredExpenses}
            onExpenseClick={(expense) => handleEditExpense(expense)}
            onEditExpense={(expense) => handleEditExpense(expense)}
            onDeleteExpense={(id) => handleDeleteExpense(id)}
          />
        </div>

        {/* Add Expense Sheet */}
        <Sheet open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <SheetContent side="bottom" className="h-[90vh]">
            <SheetHeader>
              <SheetTitle>Add Transaction</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <EnhancedQuickAddExpense
                onAddExpense={handleAddExpense}
                existingExpenses={expenses}
                accounts={accounts}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Edit Expense Sheet */}
        {editingExpense && (
          <Sheet open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
            <SheetContent side="bottom" className="h-[90vh]">
              <SheetHeader>
                <SheetTitle>Edit Transaction</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <EnhancedQuickAddExpense
                  onAddExpense={handleUpdateExpense}
                  existingExpenses={expenses}
                  accounts={accounts}
                  editingExpense={editingExpense}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </>
  );
}