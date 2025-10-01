import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { IncomeManager } from "@/components/IncomeManager";
import { mobileService } from "@/utils/mobileService";
import { useAppData } from "@/contexts/AppDataContext";
import { Helmet } from "react-helmet-async";

export default function Income() {
  const navigate = useNavigate();
  const { expenses, addExpense, updateExpense, deleteExpense } = useAppData();

  const handleUpdateExpense = (expense) => {
    const { id, ...updates } = expense;
    updateExpense(id, updates);
  };

  return (
    <>
      <Helmet>
        <title>Monthly Income - MoneyBee</title>
        <meta name="description" content="Manage your monthly income entries and track your earnings" />
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
            <h1 className="text-xl font-semibold">Monthly Income</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <IncomeManager
            expenses={expenses}
            onAddExpense={addExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={deleteExpense}
          />
        </div>
      </div>
    </>
  );
}
