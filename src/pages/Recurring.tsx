import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RecurringTransactionManager } from "@/components/RecurringTransactionManager";
import { mobileService } from "@/utils/mobileService";
import { useAppData } from "@/contexts/AppDataContext";
import { Helmet } from "react-helmet-async";

export default function Recurring() {
  const navigate = useNavigate();
  const { accounts, addExpense } = useAppData();

  return (
    <>
      <Helmet>
        <title>Recurring Transactions - MoneyBee</title>
        <meta name="description" content="Manage your recurring income and expenses like subscriptions and bills" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="flex items-center gap-3 p-3 sm:p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                mobileService.lightHaptic();
                navigate(-1);
              }}
              className="min-h-[44px] min-w-[44px] p-2"
              aria-label="Go back"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold">Recurring Transactions</h1>
          </div>
        </header>

        {/* Content */}
        <main className="overflow-y-auto scroll-smooth pb-24 px-3 py-4 sm:p-4">
          <RecurringTransactionManager
            accounts={accounts}
            onGenerateExpenses={(expenses) => {
              expenses.forEach(expense => addExpense(expense));
            }}
          />
        </main>
      </div>
    </>
  );
}