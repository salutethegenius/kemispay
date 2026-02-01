
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, SearchIcon, DownloadIcon, FilterIcon, EyeIcon } from "lucide-react";

export default function PaymentsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const itemsPerPage = 10;

  const { data: payments = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/payments"],
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000, // refetch when stale so new Transak payments appear
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
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter payments based on search term and status (Transak payments often have null payerName/payerEmail)
  const filteredPayments = payments.filter((payment: any) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      (payment.payerName ?? "").toLowerCase().includes(term) ||
      (payment.payerEmail ?? "").toLowerCase().includes(term) ||
      (payment.productName ?? "").toLowerCase().includes(term);
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Payer Name,Payer Email,Product,Amount,Platform Fee,Net Amount,Status\n" +
      filteredPayments.map((payment: any) => 
        `${formatDate(payment.createdAt)},"${payment.payerName || ''}","${payment.payerEmail || ''}","${payment.productName || ''}",${payment.amount},${payment.platformFee ?? payment.fees ?? 0},${payment.netAmount},${payment.status}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <CardTitle className="flex items-center">
            <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
            </svg>
            Payment History ({filteredPayments.length})
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export">
              <DownloadIcon className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by payer name, email, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <FilterIcon className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {paginatedPayments?.map((payment: any) => (
            <div key={payment.id} className="border border-slate-200 rounded-lg p-4 hover:border-primary/20 transition-colors" data-testid={`payment-card-${payment.id}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{payment.payerName}</div>
                  <div className="text-sm text-slate-500">{payment.payerEmail}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {formatDate(payment.createdAt)} at {formatTime(payment.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{formatCurrency(payment.amount)}</div>
                  <div className="text-sm text-slate-500">Net: {formatCurrency(payment.netAmount)}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm text-slate-600">{payment.productName}</span>
                  <span className="text-xs text-slate-500">Fee: {formatCurrency(payment.platformFee ?? payment.fees ?? 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {payment.status || 'Completed'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-700">Date & Time</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Payer Details</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Product</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Fee</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Net</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments?.map((payment: any) => (
                <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors" data-testid={`payment-row-${payment.id}`}>
                  <td className="py-4 px-4">
                    <div className="text-slate-800">{formatDate(payment.createdAt)}</div>
                    <div className="text-xs text-slate-500">{formatTime(payment.createdAt)}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-slate-800 font-medium">{payment.payerName}</div>
                    <div className="text-sm text-slate-500">{payment.payerEmail}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-800">{payment.productName || 'N/A'}</td>
                  <td className="py-4 px-4 font-medium text-slate-800">{formatCurrency(payment.amount)}</td>
                  <td className="py-4 px-4 text-slate-600">{formatCurrency(payment.platformFee ?? payment.fees ?? 0)}</td>
                  <td className="py-4 px-4 font-medium text-green-600">{formatCurrency(payment.netAmount)}</td>
                  <td className="py-4 px-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {payment.status || 'Completed'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!paginatedPayments?.length && (
          <div className="text-center py-8 text-slate-500">
            {searchTerm || statusFilter !== 'all' ? 'No payments match your filters' : 'No payments received yet'}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPayments.length)} of {filteredPayments.length} payments
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Payment Detail Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPayment(null)}>
            <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">Payment Details</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(null)}>×</Button>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-600">Date:</span>
                  <span>{formatDate(selectedPayment.createdAt)} at {formatTime(selectedPayment.createdAt)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-600">Payer:</span>
                  <span>{selectedPayment.payerName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-600">Email:</span>
                  <span>{selectedPayment.payerEmail || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-600">Product:</span>
                  <span>{selectedPayment.productName || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-600">Amount:</span>
                  <span className="font-medium">{formatCurrency(selectedPayment.amount)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-600">Fee:</span>
                  <span>{formatCurrency(selectedPayment.platformFee ?? selectedPayment.fees ?? 0)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-600">Net Amount:</span>
                  <span className="font-medium text-green-600">{formatCurrency(selectedPayment.netAmount)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-600">Status:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 w-fit">
                    {selectedPayment.status || 'Completed'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-600">Transaction ID:</span>
                  <span className="font-mono text-xs">{selectedPayment.transakOrderId || selectedPayment.id}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
