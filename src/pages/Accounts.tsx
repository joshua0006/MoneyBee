import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AccountManager } from "@/components/AccountManager";
import { mobileService } from "@/utils/mobileService";
import { useAppData } from "@/contexts/AppDataContext";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";

export default function Accounts() {
  const navigate = useNavigate();
  const { accounts, expenses, addAccount, updateAccount, deleteAccount } = useAppData();

  const handleUpdateAccount = (account) => {
    const { id, ...updates } = account;
    updateAccount(id, updates);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip link: Press '/' to focus on main content
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        const mainContent = document.getElementById('main-content');
        if (mainContent && document.activeElement?.tagName !== 'INPUT') {
          e.preventDefault();
          mainContent.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Helmet>
        <title>Accounts - MoneyBee</title>
        <meta name="description" content="Manage your bank accounts, credit cards, and other financial accounts" />
      </Helmet>

      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b border-border" role="banner">
          <div className="flex items-center gap-3 p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                mobileService.lightHaptic();
                navigate(-1);
              }}
              className="p-2"
              aria-label="Go back to previous page"
            >
              <ArrowLeft size={20} aria-hidden="true" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-xl font-semibold">Accounts</h1>
          </div>
        </header>

        {/* Content */}
        <main
          id="main-content"
          className="p-4"
          role="main"
          tabIndex={-1}
          aria-label="Account management"
        >
          <AccountManager
            accounts={accounts}
            expenses={expenses}
            onAddAccount={addAccount}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={deleteAccount}
          />
        </main>
      </div>
    </>
  );
}