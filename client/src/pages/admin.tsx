import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const ADMIN_KEY_STORAGE = "admin_api_key";
const ADMIN_OPERATOR_STORAGE = "admin_operator_email";

export default function Admin() {
  const { toast } = useToast();
  const [adminKeySet, setAdminKeySet] = useState(() =>
    typeof sessionStorage !== "undefined" && !!sessionStorage.getItem(ADMIN_KEY_STORAGE)
  );
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [operatorEmailInput, setOperatorEmailInput] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [withdrawalNotes, setWithdrawalNotes] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketResponse, setTicketResponse] = useState("");
  const [flagReason, setFlagReason] = useState("");

  const saveAdminKey = useCallback(() => {
    const key = adminKeyInput.trim();
    const operator = operatorEmailInput.trim();
    if (!key) return;
    if (!operator) {
      toast({ title: "Operator email required", description: "Enter your email for the audit trail.", variant: "destructive" });
      return;
    }
    sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
    sessionStorage.setItem(ADMIN_OPERATOR_STORAGE, operator);
    setAdminKeySet(true);
    setAdminKeyInput("");
    setOperatorEmailInput("");
    queryClient.invalidateQueries();
    toast({ title: "Signed in", description: "You can now use the dashboard." });
  }, [adminKeyInput, operatorEmailInput, toast]);

  // KYC Data
  const { data: pendingKyc = [], isLoading: kycLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/kyc-pending"],
    enabled: adminKeySet,
  });

  // Users Data
  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: adminKeySet,
  });

  // Withdrawals Data (API returns { withdrawals, enhancedReviewWithdrawalAmount })
  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery<{ withdrawals: any[]; enhancedReviewWithdrawalAmount: number }>({
    queryKey: ["/api/admin/withdrawals"],
    enabled: adminKeySet,
  });
  const withdrawals = withdrawalsData?.withdrawals ?? [];
  const enhancedReviewWithdrawalAmount = withdrawalsData?.enhancedReviewWithdrawalAmount ?? 10000;

  // Support Tickets Data
  const { data: supportTickets = [], isLoading: supportLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/support/tickets"],
    enabled: adminKeySet,
  });

  // Audit log (optional filters)
  const [auditFilters, setAuditFilters] = useState({ from: "", to: "", entityType: "all", actor: "" });
  const auditParams = new URLSearchParams();
  if (auditFilters.from) auditParams.set("from", auditFilters.from);
  if (auditFilters.to) auditParams.set("to", auditFilters.to);
  if (auditFilters.entityType && auditFilters.entityType !== "all") auditParams.set("entityType", auditFilters.entityType);
  if (auditFilters.actor) auditParams.set("actor", auditFilters.actor);
  const auditUrl = `/api/admin/audit-log${auditParams.toString() ? `?${auditParams.toString()}` : ""}`;
  const { data: auditEvents = [], isLoading: auditLoading } = useQuery<any[]>({
    queryKey: [auditUrl],
    enabled: adminKeySet,
  });

  // KYC flag and escalate mutations
  const flagMutation = useMutation({
    mutationFn: async ({ id, flagReason }: { id: string; flagReason: string }) =>
      apiRequest("POST", `/api/admin/kyc/${id}/flag`, { flagReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc-pending"] });
      setFlagReason("");
      toast({ title: "Flagged", description: "Document flagged for review." });
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });
  const escalateMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("POST", `/api/admin/kyc/${id}/escalate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc-pending"] });
      toast({ title: "Escalated", description: "Document escalated to compliance." });
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  // KYC Review Mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, reviewNotes }: { id: string, status: string, reviewNotes?: string }) => {
      return apiRequest("POST", `/api/admin/kyc/${id}/review`, { status, reviewNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc-pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedDocument(null);
      setReviewNotes("");
      toast({
        title: "Success",
        description: "KYC document reviewed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to review document",
        variant: "destructive",
      });
    },
  });

  // Withdrawal Processing Mutation
  const processWithdrawalMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string, status: string, notes?: string }) => {
      return apiRequest("POST", `/api/admin/withdrawals/${id}/process`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedWithdrawal(null);
      setWithdrawalNotes("");
      toast({
        title: "Success",
        description: "Withdrawal processed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  // User Status Update Mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string, action: string }) => {
      return apiRequest("POST", `/api/admin/users/${id}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Respond to Ticket Mutation
  const respondToTicketMutation = useMutation({
    mutationFn: async ({ id, status, adminResponse }: { id: string; status: string; adminResponse?: string }) => {
      return apiRequest("POST", `/api/admin/support/tickets/${id}/respond`, { status, adminResponse });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/tickets"] });
      setSelectedTicket(null);
      setTicketResponse("");
      toast({
        title: "Success",
        description: "Ticket updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to respond to ticket",
        variant: "destructive",
      });
    },
  });


  const handleKycReview = (status: 'approved' | 'rejected') => {
    if (!selectedDocument) return;

    reviewMutation.mutate({
      id: selectedDocument.id,
      status,
      reviewNotes: reviewNotes || undefined,
    });
  };

  const handleWithdrawalProcess = (status: 'approved' | 'rejected') => {
    if (!selectedWithdrawal) return;

    processWithdrawalMutation.mutate({
      id: selectedWithdrawal.id,
      status,
      notes: withdrawalNotes || undefined,
    });
  };

  const handleUserAction = (userId: string, action: string) => {
    updateUserMutation.mutate({ id: userId, action });
  };

  const handleTicketResponse = (status: 'open' | 'closed' | 'in_progress') => {
    if (!selectedTicket) return;

    respondToTicketMutation.mutate({
      id: selectedTicket.id,
      status,
      adminResponse: ticketResponse || undefined,
    });
  };


  if (!adminKeySet) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Platform Operations</CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Enter your admin API key and your email. Your email is recorded with each action for the audit trail.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="password"
              placeholder="Admin API key"
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveAdminKey()}
              autoFocus
            />
            <Input
              type="email"
              placeholder="Your email (operator for audit trail)"
              value={operatorEmailInput}
              onChange={(e) => setOperatorEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveAdminKey()}
            />
            <Button onClick={saveAdminKey} disabled={!adminKeyInput.trim() || !operatorEmailInput.trim()} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (kycLoading || usersLoading || withdrawalsLoading || supportLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.5 2A1.5 1.5 0 0 0 8 3.5v1A1.5 1.5 0 0 0 9.5 6h5A1.5 1.5 0 0 0 16 4.5v-1A1.5 1.5 0 0 0 14.5 2h-5zm6.5 4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1 2v2H9V8h6z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-800">KemisPay Operations</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Platform Operations</h1>
          <p className="text-slate-600">Review merchant KYC, process withdrawals, handle support, and maintain audit records. Escalate suspicious activity or high-risk decisions; do not approve above-threshold withdrawals without escalation.</p>
        </div>

        <Tabs defaultValue="kyc" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="kyc">KYC Review</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="audit">Audit log</TabsTrigger>
          </TabsList>

          {/* KYC Review Tab */}
          <TabsContent value="kyc">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending KYC Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingKyc?.map((doc: any) => (
                      <div
                        key={doc.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedDocument?.id === doc.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-slate-800">{doc.fileName}</div>
                            <div className="text-sm text-slate-600">{doc.user?.name ?? doc.vendor?.name}</div>
                            <div className="text-xs text-slate-500">{doc.user?.email ?? doc.vendor?.email}</div>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <Badge variant="outline">
                              {doc.documentType.replace('_', ' ')}
                            </Badge>
                            {(doc.flaggedAt || doc.escalatedAt) && (
                              <div className="flex gap-1">
                                {doc.flaggedAt && <Badge variant="secondary" className="text-xs">Flagged</Badge>}
                                {doc.escalatedAt && <Badge variant="destructive" className="text-xs">Escalated</Badge>}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}

                    {!pendingKyc?.length && (
                      <div className="text-center py-8 text-slate-500">
                        No pending documents to review
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Review</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDocument ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-slate-800 mb-2">Document Details</h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Merchant:</span> {selectedDocument.user?.name}</div>
                          <div><span className="font-medium">Email:</span> {selectedDocument.user?.email}</div>
                          <div><span className="font-medium">Type:</span> {selectedDocument.documentType.replace('_', ' ')}</div>
                          <div><span className="font-medium">File:</span> {selectedDocument.fileName}</div>
                          <div><span className="font-medium">Size:</span> {selectedDocument.fileSize} bytes</div>
                          <div><span className="font-medium">Uploaded:</span> {new Date(selectedDocument.uploadedAt).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Review Notes (Optional)
                        </label>
                        <Textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Add any notes about this document..."
                          rows={3}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => handleKycReview('approved')}
                          disabled={reviewMutation.isPending}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {reviewMutation.isPending ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => handleKycReview('rejected')}
                          disabled={reviewMutation.isPending}
                          variant="destructive"
                          className="flex-1"
                        >
                          {reviewMutation.isPending ? 'Processing...' : 'Reject'}
                        </Button>
                      </div>
                      <div className="border-t pt-3 mt-3 space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Flag / Escalate</label>
                        <Input
                          placeholder="Flag reason (optional)"
                          value={flagReason}
                          onChange={(e) => setFlagReason(e.target.value)}
                          className="mb-2"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={flagMutation.isPending || !flagReason.trim()}
                            onClick={() => selectedDocument && flagReason.trim() && flagMutation.mutate({ id: selectedDocument.id, flagReason: flagReason.trim() })}
                          >
                            {flagMutation.isPending ? '...' : 'Flag for review'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={escalateMutation.isPending}
                            onClick={() => selectedDocument && escalateMutation.mutate(selectedDocument.id)}
                          >
                            {escalateMutation.isPending ? '...' : 'Escalate to compliance'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      Select a document to review
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Withdrawals</CardTitle>
                  <p className="text-sm text-slate-500">Single withdrawal ≥ ${enhancedReviewWithdrawalAmount.toLocaleString()} requires enhanced review / escalation before approval.</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {withdrawals?.filter((w: any) => w.status === 'pending').map((withdrawal: any) => (
                      <div
                        key={withdrawal.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedWithdrawal?.id === withdrawal.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                        onClick={() => setSelectedWithdrawal(withdrawal)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-slate-800">${withdrawal.amount}</div>
                            <div className="text-sm text-slate-600">{withdrawal.user?.name ?? withdrawal.vendor?.name}</div>
                            <div className="text-xs text-slate-500">{withdrawal.user?.email ?? withdrawal.vendor?.email}</div>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <Badge className="bg-orange-100 text-orange-800">
                              {withdrawal.status}
                            </Badge>
                            {withdrawal.aboveEnhancedReviewThreshold && (
                              <Badge variant="destructive" className="text-xs">Above threshold – escalate</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          Requested: {new Date(withdrawal.requestedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}

                    {!withdrawals?.filter((w: any) => w.status === 'pending').length && (
                      <div className="text-center py-8 text-slate-500">
                        No pending withdrawals
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Process Withdrawal</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedWithdrawal ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-slate-800 mb-2">Withdrawal Details</h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Merchant:</span> {selectedWithdrawal.user?.name}</div>
                          <div><span className="font-medium">Email:</span> {selectedWithdrawal.user?.email}</div>
                          <div><span className="font-medium">Amount:</span> ${selectedWithdrawal.amount}</div>
                          <div><span className="font-medium">Balance:</span> ${selectedWithdrawal.wallet?.balance ?? "—"}</div>
                          <div><span className="font-medium">Requested:</span> {new Date(selectedWithdrawal.requestedAt).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Processing Notes (Optional)
                        </label>
                        <Textarea
                          value={withdrawalNotes}
                          onChange={(e) => setWithdrawalNotes(e.target.value)}
                          placeholder="Add any notes about this withdrawal..."
                          rows={3}
                        />
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          onClick={() => handleWithdrawalProcess('approved')}
                          disabled={processWithdrawalMutation.isPending}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {processWithdrawalMutation.isPending ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => handleWithdrawalProcess('rejected')}
                          disabled={processWithdrawalMutation.isPending}
                          variant="destructive"
                          className="flex-1"
                        >
                          {processWithdrawalMutation.isPending ? 'Processing...' : 'Reject'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      Select a withdrawal to process
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users?.map((user: any) => (
                    <div key={user.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="font-medium text-slate-800">{user.name}</div>
                            <Badge variant={user.isVerified ? "default" : "outline"}>
                              {user.isVerified ? "Verified" : "Unverified"}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-600 mb-1">{user.email}</div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-500">
                            <div>Balance: {user.balance != null ? `$${user.balance}` : "—"}</div>
                            <div>Total Earned: {user.totalEarned != null ? `$${user.totalEarned}` : "—"}</div>
                            <div>Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</div>
                            <div>Last Payout: {user.lastPayoutDate ? new Date(user.lastPayoutDate).toLocaleDateString() : "—"}</div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {!user.isVerified && (
                            <Button
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'verify')}
                              disabled={updateUserMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Verify
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction(user.id, user.isVerified ? 'unverify' : 'verify')}
                            disabled={updateUserMutation.isPending}
                          >
                            {user.isVerified ? 'Unverify' : 'Verify'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            disabled={updateUserMutation.isPending}
                          >
                            Suspend
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!users?.length && (
                    <div className="text-center py-8 text-slate-500">
                      No users found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Support Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {supportTickets?.map((ticket: any) => (
                      <div
                        key={ticket.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedTicket?.id === ticket.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-slate-800">Ticket #{ticket.id} - {ticket.subject}</div>
                            <div className="text-sm text-slate-600">From: {ticket.user?.name} ({ticket.user?.email})</div>
                          </div>
                          <Badge variant={ticket.status === 'open' ? 'destructive' : ticket.status === 'in_progress' ? 'secondary' : 'outline'}>
                            {ticket.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500">
                          Opened: {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}

                    {!supportTickets?.length && (
                      <div className="text-center py-8 text-slate-500">
                        No support tickets found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Respond to Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTicket ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-slate-800 mb-2">Ticket Details</h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">ID:</span> {selectedTicket.id}</div>
                          <div><span className="font-medium">Subject:</span> {selectedTicket.subject}</div>
                          <div><span className="font-medium">User:</span> {selectedTicket.user?.name} ({selectedTicket.user?.email})</div>
                          <div><span className="font-medium">Message:</span> {selectedTicket.description}</div>
                          <div><span className="font-medium">Opened:</span> {new Date(selectedTicket.createdAt).toLocaleDateString()}</div>
                          <div><span className="font-medium">Status:</span> {selectedTicket.status}</div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Your Response
                        </label>
                        <Textarea
                          value={ticketResponse}
                          onChange={(e) => setTicketResponse(e.target.value)}
                          placeholder="Add your response to the ticket..."
                          rows={3}
                        />
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          onClick={() => handleTicketResponse('closed')}
                          disabled={respondToTicketMutation.isPending}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {respondToTicketMutation.isPending ? 'Processing...' : 'Close Ticket'}
                        </Button>
                        <Button
                          onClick={() => handleTicketResponse('in_progress')}
                          disabled={respondToTicketMutation.isPending}
                          variant="outline"
                          className="flex-1"
                        >
                          {respondToTicketMutation.isPending ? 'Processing...' : 'In Progress'}
                        </Button>
                        <Button
                          onClick={() => handleTicketResponse('open')}
                          disabled={respondToTicketMutation.isPending}
                          variant="destructive"
                          className="flex-1"
                        >
                          {respondToTicketMutation.isPending ? 'Processing...' : 'Reopen Ticket'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      Select a ticket to respond
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audit log Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Audit log</CardTitle>
                <p className="text-sm text-slate-500">Record of operations actions for record-keeping and partner or bank queries.</p>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-wrap gap-2 items-end">
                  <Input
                    type="date"
                    placeholder="From"
                    className="w-40"
                    value={auditFilters.from}
                    onChange={(e) => setAuditFilters((f) => ({ ...f, from: e.target.value }))}
                  />
                  <Input
                    type="date"
                    placeholder="To"
                    className="w-40"
                    value={auditFilters.to}
                    onChange={(e) => setAuditFilters((f) => ({ ...f, to: e.target.value }))}
                  />
                  <Select value={auditFilters.entityType} onValueChange={(v) => setAuditFilters((f) => ({ ...f, entityType: v }))}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="kyc_document">KYC</SelectItem>
                      <SelectItem value="withdrawal_request">Withdrawal</SelectItem>
                      <SelectItem value="support_ticket">Support</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Actor (email)"
                    className="w-48"
                    value={auditFilters.actor}
                    onChange={(e) => setAuditFilters((f) => ({ ...f, actor: e.target.value }))}
                  />
                </div>
                {auditLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Time</th>
                          <th className="text-left py-2">Actor</th>
                          <th className="text-left py-2">Action</th>
                          <th className="text-left py-2">Entity</th>
                          <th className="text-left py-2">Entity ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditEvents?.map((ev: any) => (
                          <tr key={ev.id} className="border-b border-slate-100">
                            <td className="py-2 text-slate-600">{ev.createdAt ? new Date(ev.createdAt).toLocaleString() : ""}</td>
                            <td className="py-2">{ev.actor}</td>
                            <td className="py-2">{ev.action}</td>
                            <td className="py-2">{ev.entityType}</td>
                            <td className="py-2 font-mono text-xs">{ev.entityId}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!auditEvents?.length && (
                      <div className="text-center py-8 text-slate-500">No audit events found.</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}