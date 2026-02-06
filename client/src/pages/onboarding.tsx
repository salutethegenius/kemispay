
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, DollarSign, CreditCard, Banknote, ArrowRight } from "lucide-react";

const onboardingSteps = [
  {
    title: "Sign up",
    description: "Create your account. No paperwork, no merchant account.",
    icon: CheckCircle2,
    completed: true
  },
  {
    title: "Get a payment link",
    description: "Set your price. Send the link to your customer by text or email.",
    icon: CreditCard,
    completed: false
  },
  {
    title: "They pay",
    description: "Your customer opens the link and pays with card. Done.",
    icon: DollarSign,
    completed: false
  },
  {
    title: "You get the money",
    description: "The money goes to your balance. Use your card or send it to your bank.",
    icon: Banknote,
    completed: false
  }
];

const feeStructure = [
  { stage: "Customer pays", amount: "$500.00", notes: "USD card payment", type: "positive" },
  { stage: "Platform fee (1.5%)", amount: "–$15.00", notes: "Per transaction", type: "negative" },
  { stage: "FX/Platform fee (3%)", amount: "–$15.00", notes: "Currency conversion + platform", type: "negative" },
  { stage: "Wire transfer fee", amount: "–$25.00", notes: "One flat fee per payout (US → Bahamas)", type: "negative" },
  { stage: "Net to vendor (BSD)", amount: "$440.20", notes: "Deposited directly to your Bahamian bank", type: "final" }
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleGetStarted = () => {
    setLocation("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleNextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkipToEnd = () => {
    setCurrentStep(onboardingSteps.length - 1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.5 2A1.5 1.5 0 0 0 8 3.5v1A1.5 1.5 0 0 0 9.5 6h5A1.5 1.5 0 0 0 16 4.5v-1A1.5 1.5 0 0 0 14.5 2h-5zm6.5 4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1 2v2H9V8h6z"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-800">KemisPay</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkipToEnd}>
                Skip to End
              </Button>
              <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4 tracking-tight">
            Get Paid. Get Going.
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-6">
            KemisPay lets customers pay your business and puts the money straight onto your card or bank. No complicated setup. No waiting weeks.
          </p>
          <p className="text-base text-slate-600 max-w-xl mx-auto mb-6">
            Made for Bahamian businesses, from food vendors to online sellers.
          </p>
          <div className="bg-primary/10 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-primary font-medium">
              💡 One flat $25 wire transfer fee per payout. Consolidate monthly, keep more in your pocket.
            </p>
          </div>
        </div>

        {/* How It Works Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {onboardingSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = step.completed || index < currentStep;

              return (
                <Card key={index} className={`relative ${isActive ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader className="text-center pb-4">
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${
                      isCompleted ? 'bg-green-100 text-green-600' : 
                      isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-medium text-slate-500 mb-1">Step {index + 1}</div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-slate-600 text-center">{step.description}</p>
                  </CardContent>
                  {index < onboardingSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <ArrowRight className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Fee Structure */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Transparent Fee Structure</CardTitle>
            <p className="text-slate-600">Here's exactly how fees work with a $500 USD payment example:</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feeStructure.map((fee, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${
                  fee.type === 'final' ? 'bg-green-50 border-green-200' :
                  fee.type === 'negative' ? 'bg-red-50 border-red-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">{fee.stage}</div>
                    <div className="text-sm text-slate-600">{fee.notes}</div>
                  </div>
                  <div className={`text-lg font-bold ${
                    fee.type === 'final' ? 'text-green-600' :
                    fee.type === 'negative' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {fee.amount}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-slate-100 rounded-lg">
              <div className="text-sm text-slate-600 space-y-2">
                <p><strong>Smart payout strategy:</strong> The $25 wire fee is flat regardless of amount. Consolidate your payouts monthly to maximize your earnings:</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>• On $500 → $25 fee (5%)</div>
                  <div>• On $2,000+ → $25 fee (1.25%)</div>
                </div>
                <p className="pt-2"><strong>Perfect for:</strong> Bahamian business owners who need timely liquidity — events, services, online stores, and day-to-day operations.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Do I need a merchant account?</h3>
              <p className="text-slate-600">No! KemisPay gives you the flexibility big banks can't. We handle all payment processing, so you can start accepting cards online instantly without any merchant account setup.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Can I integrate with my website?</h3>
              <p className="text-slate-600">Absolutely! Unlike local competitors, KemisPay works with Shopify, WordPress, Wix, Squarespace, and custom sites. Your customers checkout directly on your site. No clunky redirects or standalone forms.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">How does the wire transfer fee work?</h3>
              <p className="text-slate-600">It's one flat $25 fee per payout to your Bahamian bank, no matter how much you consolidate. Smart vendors batch their payouts monthly to minimize this cost.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">What's the minimum withdrawal amount?</h3>
              <p className="text-slate-600">The minimum withdrawal amount is $25 BSD. We recommend consolidating larger amounts to maximize the value of the flat wire transfer fee.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Is KYC verification required?</h3>
              <p className="text-slate-600">Yes. Customer (payer) identity is verified by our payment provider (Transak). Merchant (business owner) verification is done by KemisPay for platform access. You can upload your documents directly through the dashboard.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">What support is available?</h3>
              <p className="text-slate-600">We provide full customer support through our ticket system. You can submit questions about technical issues, billing, KYC verification, or any other concerns.</p>
            </div>
          </CardContent>
        </Card>

        {/* Get Started Button */}
        <div className="text-center">
          <p className="text-sm text-slate-500 mb-4">Safe, simple payments. No merchant account needed.</p>
          <Button onClick={handleNextStep} size="lg" className="px-8">
            {currentStep < onboardingSteps.length - 1 ? 'Next' : 'Get Started'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}
