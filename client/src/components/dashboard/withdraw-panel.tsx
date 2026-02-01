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
import { queryClient, apiRequest } from "@/lib/queryClient";

const withdrawalSchema = z.object({
  amount: z.number().min(25, "Minimum withdrawal amount is $25").positive("Amount must be greater than 0"),
});

type WithdrawalForm = z.infer<typeof withdrawalSchema>;

interface WithdrawPanelProps {
  vendor: any;
  onWithdrawalSuccess?: () => void | Promise<void>;
}

export default function WithdrawPanel({ vendor, onWithdrawalSuccess }: WithdrawPanelProps) {
  const { toast } = useToast();
  const availableBalance = parseFloat(vendor?.balance || '0');

  const form = useForm<WithdrawalForm>({
    resolver: zodResolver(withdrawalSchema.extend({
      amount: z.number()
        .min(25, "Minimum withdrawal amount is $25")
        .max(availableBalance, `Maximum withdrawal amount is $${availableBalance.toFixed(2)}`)
        .positive("Amount must be greater than 0"),
    })),
    defaultValues: {
      amount: 0,
    },
  });

  const withdrawalMutation = useMutation({
    mutationFn: async (data: WithdrawalForm) => {
      const response = await apiRequest("POST", "/api/withdrawals", data);
      return response.json();
    },
    onSuccess: async () => {
      form.reset();
      await onWithdrawalSuccess?.();
      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WithdrawalForm) => {
    withdrawalMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11 8c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1zM15 8c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          </svg>
          Withdraw Funds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">Available Balance</span>
            <span className="text-lg font-bold text-slate-800" data-testid="text-available-balance">
              {formatCurrency(availableBalance)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Bank Account</span>
            <span className="text-sm font-medium text-slate-700" data-testid="text-bank-account">
              {vendor?.bankAccount || 'RBC •••6789'}
            </span>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Withdrawal Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-slate-500">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="pl-8"
                        data-testid="input-withdrawal-amount"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Min: $25.00</span>
                    <span>Max: {formatCurrency(availableBalance)}</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="w-full"
              disabled={withdrawalMutation.isPending || availableBalance < 25}
              data-testid="button-request-withdrawal"
            >
              {withdrawalMutation.isPending ? "Processing..." : "Request Withdrawal"}
            </Button>
          </form>
        </Form>
        
        <div className="text-xs text-slate-500 text-center">
          Processing time: 1-3 business days
        </div>
      </CardContent>
    </Card>
  );
}
