import { useState } from "react";
import { ArrowLeft, HelpCircle, MessageCircle, Book, Mail, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { mobileService } from "@/utils/mobileService";
import { Helmet } from "react-helmet-async";

export default function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      question: "How do I add my first expense?",
      answer: "Tap the bright '+' button at the bottom center of your screen, then fill in the details like amount, description, and category. You can also scan a receipt using the camera icon."
    },
    {
      question: "Can I set up recurring transactions?",
      answer: "Yes! Go to the hamburger menu and select 'Recurring'. You can set up monthly bills, weekly allowances, or any custom frequency."
    },
    {
      question: "How do I create a budget?",
      answer: "Navigate to the 'Budgets' tab at the bottom, then tap 'Add Budget'. Set a category and monthly limit to track your spending."
    },
    {
      question: "Is my financial data secure?",
      answer: "Absolutely! Your data is encrypted and stored securely. We use bank-level security and never share your information with third parties."
    },
    {
      question: "Can I export my data?",
      answer: "Yes, go to the hamburger menu and select 'Export Data'. You can download your transactions in CSV or JSON format."
    },
    {
      question: "How do I categorize my expenses?",
      answer: "When adding an expense, tap the category field to choose from predefined categories like food, transport, or entertainment. You can also create custom categories."
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const helpOptions = [
    {
      title: "Contact Support",
      description: "Get help from our support team",
      icon: MessageCircle,
      action: () => {
        mobileService.lightHaptic();
        window.open('mailto:support@moneybee.app', '_blank');
      }
    },
    {
      title: "User Guide",
      description: "Learn how to use all features",
      icon: Book,
      action: () => mobileService.lightHaptic()
    },
    {
      title: "Report Bug",
      description: "Found an issue? Let us know",
      icon: Mail,
      action: () => {
        mobileService.lightHaptic();
        window.open('mailto:bugs@moneybee.app', '_blank');
      }
    }
  ];

  return (
    <>
      <Helmet>
        <title>Help & Support - MoneyBee</title>
        <meta name="description" content="Get help and support for using MoneyBee expense tracker" />
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
            <h1 className="text-xl font-semibold">Help & Support</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          <div className="text-center py-6">
            <HelpCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">How can we help?</h2>
            <p className="text-muted-foreground">
              Find answers to common questions or contact our support team
            </p>
          </div>

          {/* Help Options */}
          <div className="grid gap-3">
            {helpOptions.map((option, index) => (
              <Card key={index} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3" onClick={option.action}>
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <option.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Search */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-2">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filteredFaqs.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No FAQs found matching your search.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            </div>
          )}

          {/* App Version */}
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                MoneyBee v1.0.0
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Made with 💛 for your financial success
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}