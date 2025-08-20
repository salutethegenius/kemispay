
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, DollarSign, CreditCard, Banknote, ArrowRight } from "lucide-react";

const onboardingSteps = [
  {
    title: "Create Your Account",
    description: "Sign up with your business details and get verified instantly",
    icon: CheckCircle2,
    completed: true
  },
  {
    title: "Generate Payment Links",
    description: "Create custom payment links for your products or services",
    icon: CreditCard,
    completed: false
  },
  {
    title: "Share & Get Paid",
    description: "Share links with customers and receive payments automatically",
    icon: DollarSign,
    completed: false
  },
  {
    title: "Withdraw Earnings",
    description: "Transfer your earnings to your local bank account in BSD",
    icon: Banknote,
    completed: false
  }
];

const feeStructure = [
  { stage: "Customer pays", amount: "$100.00", notes: "USD card", type: "positive" },
  { stage: "Stripe fee (3.9% + $0.30)", amount: "–$4.20", notes: "International processing", type: "negative" },
  { stage: "FX/Platform fee (1% + 2%)", amount: "–$3.00", notes: "Your profit + conversion buffer", type: "negative" },
  { stage: "Net to vendor (BSD)", amount: "$92.80", notes: "Local bank payout in BSD", type: "final" }
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);

  const handleGetStarted = () => {
    setLocation("/dashboard");
  };

  const handleNextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGetStarted();
    }
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
            <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
              Skip to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
            Welcome to KemisPay!
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            You don't even need a merchant account. Accept payments like a pro and get paid in BSD directly to your local bank account.
          </p>
        </div>

        {/* How It Works Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">How It Works</h2>
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
            <p className="text-slate-600">Here's exactly how fees work with a $100 USD payment example:</p>
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
              <div className="text-sm text-slate-600">
                <strong>Note:</strong> Fees include Stripe processing, international FX conversion, and our platform fee. 
                You receive the net amount directly in BSD to your local bank account.
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
              <p className="text-slate-600">No! That's the beauty of KemisPay. We handle all the payment processing for you, so you can start accepting payments immediately without setting up your own merchant account.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">What currencies can customers pay in?</h3>
              <p className="text-slate-600">Customers can pay in USD using any major credit or debit card. We handle the currency conversion and pay you in BSD.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">How long does it take to receive payments?</h3>
              <p className="text-slate-600">Payments are processed instantly, and you can request withdrawals to your local bank account. Withdrawal processing typically takes 1-3 business days.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">What's the minimum withdrawal amount?</h3>
              <p className="text-slate-600">The minimum withdrawal amount is $25 BSD. This helps reduce processing costs and ensures efficient transfers.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Is KYC verification required?</h3>
              <p className="text-slate-600">Yes, to comply with financial regulations and ensure secure transactions, we require KYC verification. You can upload your documents directly through the dashboard.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">What support is available?</h3>
              <p className="text-slate-600">We provide full customer support through our ticket system. You can submit questions about technical issues, billing, KYC verification, or any other concerns.</p>
            </div>
          </CardContent>
        </Card>

        {/* Get Started Button */}
        <div className="text-center">
          <Button onClick={handleNextStep} size="lg" className="px-8">
            {currentStep < onboardingSteps.length - 1 ? 'Next Step' : 'Get Started'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}
