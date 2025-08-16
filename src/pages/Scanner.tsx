import { ArrowLeft, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ReceiptScanner } from "@/components/ReceiptScanner";
import { mobileService } from "@/utils/mobileService";
import { Helmet } from "react-helmet-async";

export default function Scanner() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Receipt Scanner - MoneyBee</title>
        <meta name="description" content="Scan receipts with your camera to automatically add expenses" />
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
            <h1 className="text-xl font-semibold">Receipt Scanner</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-center py-8 mb-6">
            <Camera className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Scan Your Receipts</h2>
            <p className="text-muted-foreground">
              Take a photo or upload an image to automatically extract expense details
            </p>
          </div>

          <ReceiptScanner
            onExpenseExtracted={() => {}}
            onClose={() => navigate(-1)}
          />
          
          {/* Tips */}
          <div className="mt-8 p-4 bg-card rounded-lg border">
            <h3 className="font-semibold mb-3">📸 Tips for Better Scanning</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Ensure good lighting and avoid shadows</li>
              <li>• Keep the receipt flat and fully visible</li>
              <li>• Make sure text is clear and readable</li>
              <li>• Clean your camera lens for better quality</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}