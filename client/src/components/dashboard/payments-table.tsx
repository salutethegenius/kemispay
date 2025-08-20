import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PaymentsTable() {
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["/api/payments"],
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
            </svg>
            Recent Payments
          </CardTitle>
          <Button variant="outline" size="sm" data-testid="button-export">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {payments?.map((payment: any) => (
            <div key={payment.id} className="border border-slate-200 rounded-lg p-4" data-testid={`payment-card-${payment.id}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium text-slate-800">{payment.payerName}</div>
                  <div className="text-sm text-slate-500">{formatDate(payment.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{formatCurrency(payment.amount)}</div>
                  <div className="text-sm text-slate-500">Net: {formatCurrency(payment.netAmount)}</div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Fees: {formatCurrency(payment.fees)}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {payment.status || 'Completed'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Payer Name</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Fees</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Net</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments?.map((payment: any) => (
                <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`payment-row-${payment.id}`}>
                  <td className="py-4 px-4 text-slate-800">{formatDate(payment.createdAt)}</td>
                  <td className="py-4 px-4 text-slate-800">{payment.payerName}</td>
                  <td className="py-4 px-4 font-medium text-slate-800">{formatCurrency(payment.amount)}</td>
                  <td className="py-4 px-4 text-slate-600">{formatCurrency(payment.fees)}</td>
                  <td className="py-4 px-4 font-medium text-green-600">{formatCurrency(payment.netAmount)}</td>
                  <td className="py-4 px-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {payment.status || 'Completed'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!payments?.length && (
          <div className="text-center py-8 text-slate-500">
            No payments received yet
          </div>
        )}
        
        {/* Load More Button */}
        {payments?.length > 0 && (
          <div className="mt-6 text-center">
            <Button variant="link" data-testid="button-load-more">
              Load More Payments
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
