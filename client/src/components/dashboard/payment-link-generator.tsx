import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const linkGeneratorSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  amount: z.number().positive("Amount must be greater than 0"),
});

type LinkGeneratorForm = z.infer<typeof linkGeneratorSchema>;

export default function PaymentLinkGenerator() {
  const { toast } = useToast();
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const form = useForm<LinkGeneratorForm>({
    resolver: zodResolver(linkGeneratorSchema),
    defaultValues: {
      productName: "",
      amount: 0,
    },
  });

  const generateLinkMutation = useMutation({
    mutationFn: async (data: LinkGeneratorForm) => {
      const response = await apiRequest("POST", "/api/payment-links", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedLink(data.url);
      toast({
        title: "Success",
        description: "Payment link generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate payment link",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LinkGeneratorForm) => {
    generateLinkMutation.mutate(data);
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Copied!",
        description: "Payment link copied to clipboard",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H6.9C4.01 7 1.9 9.11 1.9 12s2.11 5 5 5h4v-1.9H6.9c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9.1-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.89 0 5-2.11 5-5s-2.11-5-5-5z"/>
          </svg>
          Payment Link Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product/Service Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Web Design Package"
                      data-testid="input-product-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (USD)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-slate-500">$</span>
                      <Input
                        type="number"
                        placeholder="100.00"
                        className="pl-8"
                        data-testid="input-amount"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="w-full"
              disabled={generateLinkMutation.isPending}
              data-testid="button-generate-link"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
              {generateLinkMutation.isPending ? "Generating..." : "Generate Payment Link"}
            </Button>
          </form>
        </Form>
        
        {/* Generated Link Display */}
        {generatedLink && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">Your Payment Link</label>
            <div className="flex">
              <Input
                type="text"
                readOnly
                value={generatedLink}
                className="flex-1 bg-white"
                data-testid="input-generated-link"
              />
              <Button
                onClick={copyToClipboard}
                className="ml-2"
                size="sm"
                data-testid="button-copy-link"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
