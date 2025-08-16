import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Settings } from "@/components/Settings";
import { mobileService } from "@/utils/mobileService";
import { Helmet } from "react-helmet-async";

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Settings - MoneyBee</title>
        <meta name="description" content="Customize your app preferences and account settings" />
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
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <Settings />
        </div>
      </div>
    </>
  );
}