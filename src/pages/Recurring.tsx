import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RecurringTransactionManager } from "@/components/RecurringTransactionManager";
import { mobileService } from "@/utils/mobileService";
import { useAppData } from "@/contexts/AppDataContext";
import { Helmet } from "react-helmet-async";

export default function Recurring() {
  const navigate = useNavigate();
  const { accounts } = useAppData();

  return (
    <>
      <Helmet>
        <title>Recurring Transactions - MoneyBee</title>
        <meta name="description" content="Manage your recurring income and expenses like subscriptions and bills" />
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
            <h1 className="text-xl font-semibold">Recurring</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <RecurringTransactionManager
            accounts={accounts}
            onGenerateExpenses={() => {}}
          />
        </div>
      </div>
    </>
  );
}