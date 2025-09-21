import { useState } from "react";
import { Menu, Search, Calendar, CreditCard, Repeat, Download, Settings, Receipt, Bell, Shield, HelpCircle, Target, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { mobileService } from "@/utils/mobileService";
import { useNavigate } from "react-router-dom";

interface HamburgerMenuProps {
  // No longer needed - navigation is handled internally
}

export const HamburgerMenu = ({}: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const menuItems = [
    { id: "transactions", label: "Transactions", icon: CreditCard, path: "/transactions" },
    { id: "scanner", label: "Receipt Scanner", icon: Receipt, path: "/scanner" },
    { id: "bill-splitter", label: "Bill Splitter", icon: Users, path: "/bill-splitter" },
    { id: "calendar", label: "Calendar View", icon: Calendar, path: "/calendar" },
    { id: "goals", label: "Goals", icon: Target, path: "/goals" },
    { id: "growth", label: "Wealth Growth", icon: TrendingUp, path: "/growth" },
    { id: "accounts", label: "Accounts", icon: CreditCard, path: "/accounts" },
    { id: "investments", label: "Investments", icon: TrendingUp, path: "/investments" },
    { id: "cards", label: "Credit Cards", icon: Target, path: "#", onClick: () => window.dispatchEvent(new CustomEvent('menu-cards')) },
    { id: "recurring", label: "Recurring", icon: Repeat, path: "/recurring" },
    { id: "reports", label: "Reports & Export", icon: Download, path: "/reports" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
    { id: "security", label: "Security", icon: Shield, path: "/security" },
    { id: "help", label: "Help & Support", icon: HelpCircle, path: "/help" },
  ];

  const handleMenuClick = (path: string) => {
    console.log('HamburgerMenu: Navigating to:', path);
    mobileService.lightHaptic();
    navigate(path);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2">
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-left">Features</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => handleMenuClick(item.path)}
              className="w-full justify-start hover:bg-accent/50 transition-colors touch-manipulation"
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};