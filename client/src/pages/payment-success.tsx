
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { refreshVendor, isAuthenticated } = useAuth();

  useEffect(() => {
    // Refresh vendor data to get updated balance
    if (isAuthenticated) {
      refreshVendor();
      
      // Auto-redirect to dashboard after 3 seconds
      const timer = setTimeout(() => {
        setLocation("/dashboard");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, refreshVendor, setLocation]);

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">
            Your payment has been processed successfully. Your balance will be updated shortly.
          </p>
          <p className="text-sm text-slate-500">
            Redirecting you to dashboard in 3 seconds...
          </p>
          <Button onClick={() => setLocation("/dashboard")} className="w-full">
            Go to Dashboard Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
