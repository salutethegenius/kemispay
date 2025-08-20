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
        <section className="mb-8">
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
            <PaymentsTable />
          </div>
          
          <div className="space-y-6 lg:space-y-8">
            <WithdrawPanel vendor={vendor} />
            <KycUpload vendor={vendor} />
            
            {/* Quick Actions */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  data-testid="button-view-history"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                    </svg>
                    <span className="font-medium text-slate-700">View Full History</span>
                  </div>
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                  </svg>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  data-testid="button-download-statement"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                    <span className="font-medium text-slate-700">Download Statement</span>
                  </div>
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                  </svg>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  data-testid="button-contact-support"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                    </svg>
                    <span className="font-medium text-slate-700">Contact Support</span>
                  </div>
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                  </svg>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
          <div className="text-center text-sm text-slate-600">
            <p>&copy; 2025 KemisPay. All rights reserved. | 
               <a href="#privacy" className="text-primary hover:text-primary/80 ml-1">Privacy Policy</a> | 
               <a href="#terms" className="text-primary hover:text-primary/80 ml-1">Terms of Service</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
