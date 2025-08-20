import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import Header from "@/components/layout/header";
import BalanceOverview from "@/components/dashboard/balance-overview";
import PaymentLinkGenerator from "@/components/dashboard/payment-link-generator";
import PaymentsTable from "@/components/dashboard/payments-table";
import WithdrawPanel from "@/components/dashboard/withdraw-panel";
import KycUpload from "@/components/dashboard/kyc-upload";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { vendor, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
        <section id="dashboard" className="mb-8">
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2" data-testid="title-dashboard">
              Dashboard
            </h1>
            <p className="text-slate-600">Manage your payments and track your earnings</p>
          </div>

          <BalanceOverview vendor={vendor} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <PaymentLinkGenerator />
            <div id="payments">
              <PaymentsTable />
            </div>
          </div>

          <div className="space-y-6 lg:space-y-8">
            <div id="withdraw">
              <WithdrawPanel vendor={vendor} />
            </div>
            <div id="kyc">
              <KycUpload vendor={vendor} />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
          <div className="text-center text-sm text-slate-600">
            <p>&copy; 2025 KemisPay. All rights reserved. | 
               <button onClick={() => setLocation("/onboarding")} className="text-primary hover:text-primary/80 ml-1">FAQ & How It Works</button> |
               <a href="#privacy" className="text-primary hover:text-primary/80 ml-1">Privacy Policy</a> | 
               <a href="#terms" className="text-primary hover:text-primary/80 ml-1">Terms of Service</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}