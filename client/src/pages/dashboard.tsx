import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import Header from "@/components/layout/header";
import BalanceOverview from "@/components/dashboard/balance-overview";
import PaymentLinkGenerator from "@/components/dashboard/payment-link-generator";
import PaymentsTable from "@/components/dashboard/payments-table";
import WithdrawPanel from "@/components/dashboard/withdraw-panel";
import KycUpload from "@/components/dashboard/kyc-upload";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export default function Dashboard() {
  const { vendor, isAuthenticated, refreshVendor } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  // Refetch payments and vendor balance once when dashboard mounts (so new card payments appear)
  const hasRefetched = useRef(false);
  useEffect(() => {
    if (!isAuthenticated) return;
    if (hasRefetched.current) return;
    hasRefetched.current = true;
    queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
    refreshVendor();
  }, [isAuthenticated, queryClient, refreshVendor]);

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:px-8">
        <section id="dashboard" className="mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-1 sm:mb-2" data-testid="title-dashboard">
              Dashboard
            </h1>
            <p className="text-slate-600">Your instant-access balance and payouts. Manage payments and liquidity in one place</p>
          </div>

          <BalanceOverview vendor={vendor} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <PaymentLinkGenerator />
            <div id="payments">
              <PaymentsTable />
            </div>
          </div>

          <div className="space-y-6 lg:space-y-8">
            <div id="withdraw">
              <WithdrawPanel vendor={vendor} onWithdrawalSuccess={refreshVendor} />
            </div>
            <div id="kyc">
              <KycUpload vendor={vendor} />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 lg:px-8">
          <div className="text-center text-xs sm:text-sm text-slate-600">
            <p className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1">
              <span>&copy; {new Date().getFullYear()} KemisPay. All rights reserved.</span>
              <span className="hidden sm:inline">|</span>
              <button onClick={() => setLocation("/onboarding")} className="text-primary hover:text-primary/80 px-1 py-1 min-h-[44px] min-w-[44px] touch-manipulation rounded">FAQ & How It Works</button>
              <span className="hidden sm:inline">|</span>
              <a href="/#rates" className="text-primary hover:text-primary/80 px-1 py-1 inline-block touch-manipulation rounded">Compare rates</a>
              <span className="hidden sm:inline">|</span>
              <button onClick={() => setLocation("/privacy")} className="text-primary hover:text-primary/80 px-1 py-1 min-h-[44px] min-w-[44px] touch-manipulation rounded">Privacy Policy</button>
              <span className="hidden sm:inline">|</span>
              <button onClick={() => setLocation("/terms")} className="text-primary hover:text-primary/80 px-1 py-1 min-h-[44px] min-w-[44px] touch-manipulation rounded">Terms of Service</button>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}