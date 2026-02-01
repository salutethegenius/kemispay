import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function OrderConfirmation() {
  const linkId = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("linkId");

  const [order, setOrder] = useState<{
    linkId: string;
    productName: string;
    amount: string;
    vendorName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!linkId) {
      setLoading(false);
      setError("Invalid order");
      return;
    }
    let cancelled = false;
    fetch(`/api/payment-links/public/${linkId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Order not found");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? "Could not load order");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [linkId]);

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center text-slate-600">
            {error ?? "Order not found"}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Order Confirmed!
          </CardTitle>
          <p className="text-slate-600 text-sm mt-2">
            Thank you for your payment. Your order has been processed.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <h4 className="font-medium text-slate-800">Order summary</h4>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Item</span>
              <span className="font-medium">{order.productName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">From</span>
              <span className="font-medium">{order.vendorName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Amount paid</span>
              <span className="font-medium">
                {formatCurrency(order.amount)} USDC
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
              <span className="text-slate-600">Status</span>
              <span className="font-medium text-green-600">Paid</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center">
            The vendor has been notified and will process your order.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => (window.location.href = "/")}
          >
            Return home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
