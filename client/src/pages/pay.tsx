import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PayPage() {
  const [, params] = useRoute("/pay/:linkId");
  const [, setLocation] = useLocation();
  const linkId = params?.linkId;
  const [linkDetails, setLinkDetails] = useState<{
    linkId: string;
    productName: string;
    amount: string;
    vendorName: string;
  } | null>(null);
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!linkId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [detailsRes, widgetRes] = await Promise.all([
          fetch(`/api/payment-links/public/${linkId}`),
          fetch(`/api/transak/widget-url?linkId=${encodeURIComponent(linkId)}`),
        ]);
        if (cancelled) return;
        if (!detailsRes.ok) {
          setError("Payment link not found");
          return;
        }
        if (!widgetRes.ok) {
          const data = await widgetRes.json().catch(() => ({}));
          setError(data.message || "Unable to load payment");
          return;
        }
        const details = await detailsRes.json();
        const { widgetUrl: url } = await widgetRes.json();
        setLinkDetails(details);
        setWidgetUrl(url);
      } catch (e) {
        if (!cancelled) setError("Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [linkId]);

  useEffect(() => {
    if (!widgetUrl) return;
    const TRANSAK_ORIGINS = [
      "https://global-stg.transak.com",
      "https://global.transak.com",
    ];
    const handleMessage = (event: MessageEvent) => {
      if (!TRANSAK_ORIGINS.includes(event.origin)) return;
      if (event.data?.event_id === "TRANSAK_ORDER_SUCCESSFUL") {
        setLocation(`/order-confirmation?linkId=${encodeURIComponent(linkId || "")}`);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [widgetUrl, setLocation, linkId]);

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  if (!linkId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center text-slate-600">
            Invalid payment link
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !linkDetails) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center text-slate-600">
            {error ?? "Payment link not found"}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-6">
      <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col gap-4">
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">{linkDetails.productName}</CardTitle>
            <p className="text-slate-600 text-sm">from {linkDetails.vendorName}</p>
          </CardHeader>
          <CardContent className="text-center">
            <span className="text-2xl font-bold text-slate-800">
              {formatCurrency(linkDetails.amount)}
            </span>
            <span className="text-slate-500 text-sm ml-1">USDC</span>
          </CardContent>
        </Card>
        <div className="flex-1 min-h-[500px] rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
          {widgetUrl ? (
            <iframe
              ref={iframeRef}
              src={widgetUrl}
              title="Pay with card"
              allow="camera;microphone;payment"
              className="w-full h-full min-h-[500px] border-0"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
