import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AccountManager } from "@/components/AccountManager";
import { mobileService } from "@/utils/mobileService";
import { useAppData } from "@/contexts/AppDataContext";
import { Helmet } from "react-helmet-async";

export default function Accounts() {
  const navigate = useNavigate();
  const { accounts, expenses, addAccount, updateAccount, deleteAccount } = useAppData();

  const handleUpdateAccount = (account) => {
    const { id, ...updates } = account;
    updateAccount(id, updates);
  };

  return (
    <>
      <Helmet>
        <title>Accounts - MoneyBee</title>
        <meta name="description" content="Manage your bank accounts, credit cards, and other financial accounts" />
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
            <h1 className="text-xl font-semibold">Accounts</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <AccountManager
            accounts={accounts}
            expenses={expenses}
            onAddAccount={addAccount}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={deleteAccount}
          />
        </div>
      </div>
    </>
  );
}