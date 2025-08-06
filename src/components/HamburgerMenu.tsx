import { useState } from "react";
import { Menu, Search, Calendar, CreditCard, Repeat, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { mobileService } from "@/utils/mobileService";

interface HamburgerMenuProps {
  onMenuItemClick: (item: string) => void;
}

export const HamburgerMenu = ({ onMenuItemClick }: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const menuItems = [
    { id: "search", label: "Search & Filter", icon: Search },
    { id: "calendar", label: "Calendar View", icon: Calendar },
    { id: "accounts", label: "Accounts", icon: CreditCard },
    { id: "recurring", label: "Recurring", icon: Repeat },
    { id: "export", label: "Export Data", icon: Download },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleMenuClick = (id: string) => {
    console.log('Menu item clicked:', id); // Debug log
    mobileService.lightHaptic();
    onMenuItemClick(id);
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
              onClick={() => handleMenuClick(item.id)}
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