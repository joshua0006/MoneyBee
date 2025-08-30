import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BudgetManager } from "@/components/BudgetManager";
import { mobileService } from "@/utils/mobileService";
import { Helmet } from "react-helmet-async";
import { useAppData } from "@/hooks/useAppData";
import type { Budget } from "@/types/app";

export default function Budgets() {
  const navigate = useNavigate();
  const { budgets, expenses, addBudget, updateBudget, deleteBudget } = useAppData();

  const handleUpdateBudget = (budget: Budget) => {
    updateBudget(budget.id, budget);
  };

  return (
    <>
      <Helmet>
        <title>Budgets - MoneyBee</title>
        <meta name="description" content="Set and track your spending budgets to stay on financial track" />
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
            <h1 className="text-xl font-semibold">Budgets</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <BudgetManager
            budgets={budgets}
            expenses={expenses}
            onAddBudget={addBudget}
            onUpdateBudget={handleUpdateBudget}
            onDeleteBudget={deleteBudget}
          />
        </div>
      </div>
    </>
  );
}