import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { toast } = useToast();
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const { data: pendingKyc = [], isLoading } = useQuery({
    queryKey: ["/api/admin/kyc-pending"],
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, reviewNotes }: { id: string, status: string, reviewNotes?: string }) => {
      return apiRequest("POST", `/api/admin/kyc/${id}/review`, { status, reviewNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc-pending"] });
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

  const handleReview = (status: 'approved' | 'rejected') => {
    if (!selectedDocument) return;
    
    reviewMutation.mutate({
      id: selectedDocument.id,
      status,
      reviewNotes: reviewNotes || undefined,
    });
  };

  if (isLoading) {
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
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">KYC Review</h1>
          <p className="text-slate-600">Review and approve vendor verification documents</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Documents</CardTitle>
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
                    data-testid={`document-${doc.id}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-slate-800">{doc.fileName}</div>
                        <div className="text-sm text-slate-600">{doc.vendor?.name}</div>
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

          {/* Review Panel */}
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
                      data-testid="textarea-review-notes"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleReview('approved')}
                      disabled={reviewMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      data-testid="button-approve"
                    >
                      {reviewMutation.isPending ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => handleReview('rejected')}
                      disabled={reviewMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                      data-testid="button-reject"
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
      </main>
    </div>
  );
}
