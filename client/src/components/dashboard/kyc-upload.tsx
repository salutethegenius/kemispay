import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface KycUploadProps {
  vendor: any;
}

export default function KycUpload({ vendor }: KycUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string | null>(null);

  const { data: kycDocuments = [] } = useQuery({
    queryKey: ["/api/kyc"],
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ documentType, file }: { documentType: string, file: File }) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Data = reader.result?.toString().split(',')[1] || '';
            const response = await apiRequest("POST", "/api/kyc/upload", {
              documentType,
              fileName: file.name,
              fileData: base64Data,
            });
            resolve(response.json());
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kyc"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/profile"] });
      setUploading(null);
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    },
    onError: (error: any) => {
      setUploading(null);
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (documentType: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = documentType === 'selfie' ? 'image/*' : 'image/*,application/pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({
            title: "Error",
            description: "File size must be less than 10MB",
            variant: "destructive",
          });
          return;
        }
        setUploading(documentType);
        uploadMutation.mutate({ documentType, file });
      }
    };
    input.click();
  };

  const getDocumentStatus = (documentType: string) => {
    const doc = kycDocuments?.find((d: any) => d.documentType === documentType);
    return doc?.status || 'not_uploaded';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      default:
        return <Badge variant="outline">Not Uploaded</Badge>;
    }
  };

  const documentTypes = [
    {
      type: 'government_id',
      label: 'Government ID',
      description: 'PNG, JPG up to 10MB',
      icon: (
        <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
    },
    {
      type: 'proof_of_address',
      label: 'Proof of Address',
      description: 'PDF, PNG, JPG up to 10MB',
      icon: (
        <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ),
    },
    {
      type: 'selfie',
      label: 'Selfie Verification',
      description: 'Clear photo with ID visible',
      icon: (
        <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          Account Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KYC Status */}
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center">
          <svg className="w-5 h-5 text-orange-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <div>
            <div className="font-medium text-orange-800">
              {vendor?.isVerified ? 'Verification Complete' : 'Verification Required'}
            </div>
            <div className="text-sm text-orange-700">
              {vendor?.isVerified 
                ? 'Your account is verified and ready to receive payouts'
                : 'Complete verification to receive payouts'
              }
            </div>
          </div>
        </div>
        
        {/* Upload Forms */}
        <div className="space-y-4">
          {documentTypes.map((docType) => {
            const status = getDocumentStatus(docType.type);
            const isUploading = uploading === docType.type;
            
            return (
              <div key={docType.type}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">{docType.label}</label>
                  {getStatusBadge(status)}
                </div>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                    status === 'approved' 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-slate-300 hover:border-primary'
                  }`}
                  onClick={() => !isUploading && status !== 'approved' && handleFileUpload(docType.type)}
                  data-testid={`upload-${docType.type}`}
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mr-2" />
                      <span className="text-sm text-slate-600">Uploading...</span>
                    </div>
                  ) : status === 'approved' ? (
                    <div className="flex items-center justify-center text-green-600">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span className="text-sm font-medium">Approved</span>
                    </div>
                  ) : (
                    <>
                      {docType.icon}
                      <div className="text-sm text-slate-600 mt-2">
                        <span className="font-medium text-primary">
                          {status === 'not_uploaded' ? 'Click to upload' : 'Click to replace'}
                        </span> or drag and drop
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{docType.description}</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Status Display */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Verification Status</span>
            <Badge className={vendor?.isVerified ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
              {vendor?.isVerified ? 'Verified' : 'Pending Review'}
            </Badge>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Documents are securely stored using Storj encryption
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
