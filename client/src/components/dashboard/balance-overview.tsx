import { Card, CardContent } from "@/components/ui/card";

interface BalanceOverviewProps {
  vendor: any;
}

export default function BalanceOverview({ vendor }: BalanceOverviewProps) {
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const formatDate = (date: string | Date) => {
    if (!date) return 'No payouts yet';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {/* Current Balance */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Available</span>
          </div>
          <div className="mb-1">
            <span className="text-2xl lg:text-3xl font-bold text-slate-800" data-testid="text-current-balance">
              {formatCurrency(vendor?.balance || 0)}
            </span>
            <span className="text-slate-500 text-sm ml-1">BSD</span>
          </div>
          <p className="text-sm text-slate-600">Current Balance</p>
        </CardContent>
      </Card>
      
      {/* Total Earned */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">+12.5%</span>
          </div>
          <div className="mb-1">
            <span className="text-2xl lg:text-3xl font-bold text-slate-800" data-testid="text-total-earned">
              {formatCurrency(vendor?.totalEarned || 0)}
            </span>
          </div>
          <p className="text-sm text-slate-600">Total Earned</p>
        </CardContent>
      </Card>
      
      {/* Last Payout */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 8c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1zM15 8c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {vendor?.bankAccount || 'RBC Bank'}
            </span>
          </div>
          <div className="mb-1">
            <span className="text-lg lg:text-xl font-bold text-slate-800" data-testid="text-last-payout">
              {formatDate(vendor?.lastPayoutDate)}
            </span>
          </div>
          <p className="text-sm text-slate-600">Last Payout</p>
        </CardContent>
      </Card>
    </div>
  );
}
