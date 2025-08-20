import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const ticketSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
  description: z.string().min(1, "Description is required").max(2000, "Description too long"),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.enum(['technical', 'billing', 'kyc', 'withdrawal', 'general']),
});

type TicketForm = z.infer<typeof ticketSchema>;

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export default function Support() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("new");

  const form = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      description: "",
      priority: "medium",
      category: "general",
    },
  });

  // Fetch support tickets
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/support/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch tickets");
      return response.json() as Promise<SupportTicket[]>;
    },
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketForm) => {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create ticket");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      form.reset();
      setActiveTab("tickets");
      toast({
        title: "Success",
        description: "Support ticket created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TicketForm) => {
    createTicketMutation.mutate(data);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Support Center</h1>
          <p className="text-slate-600">Get help with your KemisPay account</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="new">New Ticket</TabsTrigger>
            <TabsTrigger value="faq">FAQ & Fees</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Support Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="general">General Support</SelectItem>
                                <SelectItem value="technical">Technical Issue</SelectItem>
                                <SelectItem value="billing">Billing</SelectItem>
                                <SelectItem value="kyc">KYC Verification</SelectItem>
                                <SelectItem value="withdrawal">Withdrawal Issue</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief description of your issue" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please provide detailed information about your issue..."
                              rows={6}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createTicketMutation.isPending}
                    >
                      {createTicketMutation.isPending ? "Submitting..." : "Submit Ticket"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            {!tickets?.length ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-slate-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                    </svg>
                    <h3 className="text-lg font-medium mb-2">No support tickets yet</h3>
                    <p className="text-sm">Submit your first ticket to get help from our support team.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              tickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-slate-800">{ticket.subject}</h3>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{ticket.description}</p>
                        {ticket.adminResponse && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-blue-800 mb-1">Support Response:</h4>
                            <p className="text-sm text-blue-700">{ticket.adminResponse}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>#{ticket.id.slice(0, 8)}</span>
                          <span>{ticket.category}</span>
                          <span>Created: {formatDate(ticket.createdAt)}</span>
                          {ticket.resolvedAt && (
                            <span>Resolved: {formatDate(ticket.resolvedAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fee Structure</CardTitle>
                <p className="text-slate-600">Transparent pricing with example based on $100 USD payment:</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium">Customer pays</div>
                      <div className="text-sm text-slate-600">USD card</div>
                    </div>
                    <div className="font-bold text-blue-600">$100.00</div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium">Stripe fee (3.9% + $0.30)</div>
                      <div className="text-sm text-slate-600">International processing</div>
                    </div>
                    <div className="font-bold text-red-600">–$4.20</div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium">FX/Platform fee (1% + 2%)</div>
                      <div className="text-sm text-slate-600">Your profit + conversion buffer</div>
                    </div>
                    <div className="font-bold text-red-600">–$3.00</div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-2 border-green-200">
                    <div>
                      <div className="font-medium">Net to vendor (BSD)</div>
                      <div className="text-sm text-slate-600">Local bank payout in BSD</div>
                    </div>
                    <div className="font-bold text-green-600">$92.80</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">How does onboarding work?</h3>
                  <p className="text-slate-600">Once you sign up, you'll be guided through a quick onboarding process to set up your profile and payment methods.</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Do I need a merchant account?</h3>
                  <p className="text-slate-600">No! KemisPay handles all payment processing, so you can start accepting payments immediately.</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">What's the minimum withdrawal?</h3>
                  <p className="text-slate-600">$25 BSD minimum withdrawal to reduce processing costs.</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">How long do withdrawals take?</h3>
                  <p className="text-slate-600">1-3 business days to your local bank account.</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">What currencies do you accept?</h3>
                  <p className="text-slate-600">Customers pay in USD, you receive BSD in your local bank.</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Is KYC required?</h3>
                  <p className="text-slate-600">Yes, KYC verification is required for compliance and security.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}