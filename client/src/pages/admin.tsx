
import { useState } from "react";
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

export default function Admin() {
  const { toast } = useToast();
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [withdrawalNotes, setWithdrawalNotes] = useState("");

  // KYC Data
  const { data: pendingKyc = [], isLoading: kycLoading } = useQuery({
    queryKey: ["/api/admin/kyc-pending"],
  });

  // Users Data
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // Withdrawals Data
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["/api/admin/withdrawals"],
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

  if (kycLoading || usersLoading || withdrawalsLoading) {
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
              <span className="text-xl font-bold text-slate-800">KemisPay Admin</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Manage users, KYC approvals, and withdrawal requests</p>
        </div>

        <Tabs defaultValue="kyc" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="kyc">KYC Review</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
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
                            <div className="text-sm text-slate-600">{doc.vendor?.name}</div>
                            <div className="text-xs text-slate-500">{doc.vendor?.email}</div>
                          </div>
                          <Badge variant="outline">
                            {doc.documentType.replace('_', ' ')}
                          </Badge>
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
                          <div><span className="font-medium">Vendor:</span> {selectedDocument.vendor?.name}</div>
                          <div><span className="font-medium">Email:</span> {selectedDocument.vendor?.email}</div>
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

                      <div className="flex space-x-3">
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
                            <div className="text-sm text-slate-600">{withdrawal.vendor?.name}</div>
                            <div className="text-xs text-slate-500">{withdrawal.vendor?.email}</div>
                          </div>
                          <Badge className="bg-orange-100 text-orange-800">
                            {withdrawal.status}
                          </Badge>
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
                          <div><span className="font-medium">Vendor:</span> {selectedWithdrawal.vendor?.name}</div>
                          <div><span className="font-medium">Email:</span> {selectedWithdrawal.vendor?.email}</div>
                          <div><span className="font-medium">Amount:</span> ${selectedWithdrawal.amount}</div>
                          <div><span className="font-medium">Balance:</span> ${selectedWithdrawal.vendor?.balance}</div>
                          <div><span className="font-medium">Bank Account:</span> {selectedWithdrawal.vendor?.bankAccount || 'Not provided'}</div>
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
                            <div>Balance: ${user.balance}</div>
                            <div>Total Earned: ${user.totalEarned}</div>
                            <div>Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                            <div>Last Payout: {user.lastPayoutDate ? new Date(user.lastPayoutDate).toLocaleDateString() : 'Never'}</div>
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
        </Tabs>
      </main>
    </div>
  );
}
