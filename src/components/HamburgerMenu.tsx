import { useState } from "react";
import { Menu, Search, Calendar, CreditCard, Clock, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface HamburgerMenuProps {
  onMenuItemClick: (item: string) => void;
}

export const HamburgerMenu = ({ onMenuItemClick }: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "search", icon: Search, label: "Search & Filter", description: "Find specific transactions" },
    { id: "calendar", icon: Calendar, label: "Calendar View", description: "View expenses by date" },
    { id: "accounts", icon: CreditCard, label: "Account Manager", description: "Manage payment methods" },
    { id: "recurring", icon: Clock, label: "Recurring Transactions", description: "Set up automatic entries" },
  ];

  const handleItemClick = (itemId: string) => {
    onMenuItemClick(itemId);
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
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => handleItemClick(item.id)}
              className="w-full justify-start h-auto p-3 text-left"
            >
              <div className="flex items-start gap-3">
                <item.icon size={18} className="mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </div>
            </Button>
          ))}
          
          <Separator className="my-4" />
          
          <Button
            variant="ghost"
            onClick={() => handleItemClick("export")}
            className="w-full justify-start h-auto p-3 text-left"
          >
            <div className="flex items-start gap-3">
              <Download size={18} className="mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">Export Data</div>
                <div className="text-xs text-muted-foreground">Download your transactions</div>
              </div>
            </div>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};