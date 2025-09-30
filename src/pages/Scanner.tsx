import { ArrowLeft, Camera, Upload, HelpCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ReceiptScanner } from "@/components/ReceiptScanner";
import { mobileService } from "@/utils/mobileService";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";

export default function Scanner() {
  const navigate = useNavigate();
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Show keyboard help with '?'
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowKeyboardHelp(prev => !prev);
      }
      // Back with Escape
      if (e.key === 'Escape' && !showKeyboardHelp) {
        navigate(-1);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [navigate, showKeyboardHelp]);

  return (
    <>
      <Helmet>
        <title>Receipt Scanner - MoneyBee</title>
        <meta name="description" content="Scan receipts with your camera to automatically add expenses. Accessible interface with keyboard navigation and screen reader support." />
      </Helmet>

      {/* Skip to main content for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>

      <div className="h-screen overflow-y-auto bg-background" role="document">
        {/* Header */}
        <header
          className="sticky top-0 z-40 bg-background border-b border-border"
          role="banner"
        >
          <div className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  mobileService.lightHaptic();
                  navigate(-1);
                }}
                className="p-2 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Go back to previous page"
              >
                <ArrowLeft size={20} aria-hidden="true" />
              </Button>
              <h1 className="text-xl font-semibold">Receipt Scanner</h1>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
              className="p-2 focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label={showKeyboardHelp ? "Hide keyboard shortcuts" : "Show keyboard shortcuts"}
              aria-expanded={showKeyboardHelp}
            >
              <HelpCircle size={20} aria-hidden="true" />
            </Button>
          </div>

          {/* Keyboard Help Overlay */}
          {showKeyboardHelp && (
            <div
              className="bg-muted border-t border-border p-4"
              role="region"
              aria-label="Keyboard shortcuts"
            >
              <h2 className="text-sm font-semibold mb-2">Keyboard Shortcuts</h2>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li><kbd className="px-2 py-1 bg-background rounded border">?</kbd> Toggle this help</li>
                <li><kbd className="px-2 py-1 bg-background rounded border">Esc</kbd> Go back</li>
                <li><kbd className="px-2 py-1 bg-background rounded border">Tab</kbd> Navigate between elements</li>
                <li><kbd className="px-2 py-1 bg-background rounded border">Enter</kbd> or <kbd className="px-2 py-1 bg-background rounded border">Space</kbd> Activate buttons</li>
              </ul>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main id="main-content" className="p-4 pb-24" role="main">
          {/* Scanner Component */}
          <ReceiptScanner
            onExpenseExtracted={() => {}}
            onClose={() => navigate(-1)}
          />

          {/* Accessible Tips Section */}
          <section
            className="mt-8 max-w-2xl mx-auto"
            aria-labelledby="tips-heading"
          >
            <div className="p-6 bg-card rounded-lg border shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <Lightbulb
                  className="w-6 h-6 text-primary flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <h3
                  id="tips-heading"
                  className="text-lg font-semibold"
                >
                  Tips for Better Scanning
                </h3>
              </div>

              <ul className="space-y-3" role="list">
                <li className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm"
                    aria-hidden="true"
                  >
                    1
                  </span>
                  <span className="text-base text-muted-foreground leading-relaxed">
                    Ensure good lighting and avoid shadows on the receipt
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm"
                    aria-hidden="true"
                  >
                    2
                  </span>
                  <span className="text-base text-muted-foreground leading-relaxed">
                    Keep the receipt flat and fully visible in the frame
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm"
                    aria-hidden="true"
                  >
                    3
                  </span>
                  <span className="text-base text-muted-foreground leading-relaxed">
                    Make sure all text is clear and readable without blur
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm"
                    aria-hidden="true"
                  >
                    4
                  </span>
                  <span className="text-base text-muted-foreground leading-relaxed">
                    Clean your camera lens for the best image quality
                  </span>
                </li>
              </ul>

              <div
                className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground"
                role="note"
              >
                <p>
                  <strong>Accessibility tip:</strong> You can edit the extracted text if needed.
                  All controls are keyboard accessible using Tab and Enter keys.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}