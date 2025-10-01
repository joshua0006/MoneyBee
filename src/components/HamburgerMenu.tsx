import { useState } from "react";
import { Menu, Calendar, Repeat, Settings, HelpCircle } from "lucide-react";
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
    { id: "calendar", label: "Calendar View", icon: Calendar, path: "/calendar" },
    { id: "recurring", label: "Recurring", icon: Repeat, path: "/recurring" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
    { id: "help", label: "Help & Support", icon: HelpCircle, path: "/help" },
  ];

  const handleMenuClick = (path: string) => {
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
        
        <div className="mt-6 overflow-y-auto max-h-[calc(100vh-8rem)] -mx-6 px-6 space-y-2">
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