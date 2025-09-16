import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    console.log('Login attempt with:', data);

    try {
      const response = await apiRequest("POST", "/api/auth/login", data);
      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorResult = await response.json();
        console.error('Login failed:', errorResult);
        toast({
          title: "Login Failed",
          description: errorResult.message || "Failed to login",
          variant: "destructive",
        });
        return;
      }

      const result = await response.json();
      console.log('Login success:', { hasToken: !!result.token, hasVendor: !!result.vendor, isNewUser: result.isNewUser });

      if (result.token && result.vendor) {
        await login(result.token, result.vendor);
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });

        // Route new users to onboarding, existing users to dashboard
        setLocation(result.isNewUser ? "/onboarding" : "/dashboard");
      } else {
        console.error('Missing token or vendor in response:', result);
        toast({
          title: "Error",
          description: "Invalid login response",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error.message || "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.5 2A1.5 1.5 0 0 0 8 3.5v1A1.5 1.5 0 0 0 9.5 6h5A1.5 1.5 0 0 0 16 4.5v-1A1.5 1.5 0 0 0 14.5 2h-5zm6.5 4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1 2v2H9V8h6z"/>
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">KemisPay</CardTitle>
          </div>
          <p className="text-slate-600">You don't even need a merchant account. Accept payments like a pro.</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        data-testid="input-email"
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
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm text-slate-600">
            New vendor? We'll create your account automatically.
          </div>
        </CardContent>
      </Card>

      {/* Comparison Section */}
      <div className="mt-12 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-3">
            How KemisPay Stacks Up
          </h2>
          <p className="text-lg text-slate-600 mb-4">
            Compare KemisPay to other local payment options in The Bahamas
          </p>
          <div className="inline-block bg-primary/10 rounded-lg px-4 py-2">
            <p className="text-primary font-semibold">
              ✨ Others hide fees. We show them. Others limit you. We integrate you.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          {/* Mobile View */}
          <div className="lg:hidden">
            <div className="p-4 space-y-6">
              {[
                { name: "KemisPay", highlight: true },
                { name: "Kanoo" },
                { name: "SunCash" },
                { name: "Fygaro" },
                { name: "TicketFlare" },
                { name: "PayPal" }
              ].map((provider, index) => (
                <div key={provider.name} className={`p-4 rounded-lg border-2 ${provider.highlight ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                  <h3 className={`font-bold text-lg mb-3 ${provider.highlight ? 'text-primary' : 'text-slate-800'}`}>
                    {provider.name}
                    {provider.highlight && <span className="ml-2 text-sm bg-primary text-white px-2 py-1 rounded-full">Best Choice</span>}
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-slate-700">Transaction Fees:</span>
                      <div className="text-slate-600">
                        {provider.name === "KemisPay" && "3.9% + 3% FX"}
                        {provider.name === "Kanoo" && "Unclear / varies"}
                        {provider.name === "SunCash" && "Unclear / varies"}
                        {provider.name === "Fygaro" && "~2.5%–3% (via gateway)"}
                        {provider.name === "TicketFlare" && "5% per ticket"}
                        {provider.name === "PayPal" && "~3.49% + FX fee"}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Wire Fees:</span>
                      <div className="text-slate-600">
                        {provider.name === "KemisPay" && "Flat $25 per payout"}
                        {provider.name === "Kanoo" && "Not transparent"}
                        {provider.name === "SunCash" && "Not transparent"}
                        {provider.name === "Fygaro" && "Varies by bank"}
                        {provider.name === "TicketFlare" && "Not listed"}
                        {provider.name === "PayPal" && "$5–$15 + FX"}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">E-Commerce:</span>
                      <div className="text-slate-600">
                        {provider.name === "KemisPay" && "✅ Full website integration"}
                        {provider.name === "Kanoo" && "❌ Limited / wallet only"}
                        {provider.name === "SunCash" && "❌ Limited / wallet only"}
                        {provider.name === "Fygaro" && "✅ Yes (invoices, stores)"}
                        {provider.name === "TicketFlare" && "⚠️ Tickets only"}
                        {provider.name === "PayPal" && "✅ Yes (global)"}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Payout Speed:</span>
                      <div className="text-slate-600">
                        {provider.name === "KemisPay" && "As soon as you consolidate"}
                        {provider.name === "Kanoo" && "Same day in-wallet"}
                        {provider.name === "SunCash" && "Instant in wallet → slower to bank"}
                        {provider.name === "Fygaro" && "2–5 business days"}
                        {provider.name === "TicketFlare" && "2–5 days after event"}
                        {provider.name === "PayPal" && "2–7 business days"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-primary bg-primary/10">
                    KemisPay
                    <div className="text-xs font-normal text-primary mt-1">Best Choice</div>
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-700">Kanoo</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-700">SunCash</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-700">Fygaro</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-700">TicketFlare</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-700">PayPal</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-800">Transaction Fees</td>
                  <td className="py-4 px-4 text-center bg-primary/5">
                    <div className="font-semibold text-primary">3.9% + 3% FX</div>
                    <div className="text-xs text-slate-600 mt-1">Transparent pricing</div>
                  </td>
                  <td className="py-4 px-4 text-center text-slate-600">Unclear / varies</td>
                  <td className="py-4 px-4 text-center text-slate-600">Unclear / varies</td>
                  <td className="py-4 px-4 text-center text-slate-600">~2.5%–3%</td>
                  <td className="py-4 px-4 text-center text-slate-600">5% per ticket</td>
                  <td className="py-4 px-4 text-center text-slate-600">~3.49% + FX fee</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-800">Bank Transfer / Wire Fees</td>
                  <td className="py-4 px-4 text-center bg-primary/5">
                    <div className="font-semibold text-primary">Flat $25 per payout</div>
                    <div className="text-xs text-slate-600 mt-1">Batch monthly</div>
                  </td>
                  <td className="py-4 px-4 text-center text-slate-600">Not transparent</td>
                  <td className="py-4 px-4 text-center text-slate-600">Not transparent</td>
                  <td className="py-4 px-4 text-center text-slate-600">Varies by bank</td>
                  <td className="py-4 px-4 text-center text-slate-600">Not listed</td>
                  <td className="py-4 px-4 text-center text-slate-600">$5–$15 + FX</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-800">E-Commerce Integration</td>
                  <td className="py-4 px-4 text-center bg-primary/5">
                    <div className="font-semibold text-green-600">✅ Full website plugin</div>
                    <div className="text-xs text-slate-600 mt-1">+ Stripe carts</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="font-semibold text-red-600">❌ Limited</div>
                    <div className="text-xs text-slate-600 mt-1">Wallet only</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="font-semibold text-red-600">❌ Limited</div>
                    <div className="text-xs text-slate-600 mt-1">Wallet only</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="font-semibold text-green-600">✅ Yes</div>
                    <div className="text-xs text-slate-600 mt-1">Invoices, stores</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="font-semibold text-orange-600">⚠️ Tickets only</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="font-semibold text-green-600">✅ Yes</div>
                    <div className="text-xs text-slate-600 mt-1">Global</div>
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-4 px-6 font-medium text-slate-800">Payout Speed</td>
                  <td className="py-4 px-4 text-center bg-primary/5">
                    <div className="font-semibold text-primary">As soon as you consolidate</div>
                    <div className="text-xs text-slate-600 mt-1">Your choice</div>
                  </td>
                  <td className="py-4 px-4 text-center text-slate-600">Same day in-wallet</td>
                  <td className="py-4 px-4 text-center text-slate-600">Instant in wallet → slower to bank</td>
                  <td className="py-4 px-4 text-center text-slate-600">2–5 business days</td>
                  <td className="py-4 px-4 text-center text-slate-600">2–5 days after event</td>
                  <td className="py-4 px-4 text-center text-slate-600">2–7 business days</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-slate-800">Target Use Case</td>
                  <td className="py-4 px-4 text-center bg-primary/5">
                    <div className="font-semibold text-primary">Events, services, stores</div>
                    <div className="text-xs text-slate-600 mt-1">Full flexibility</div>
                  </td>
                  <td className="py-4 px-4 text-center text-slate-600">Peer-to-peer transfers</td>
                  <td className="py-4 px-4 text-center text-slate-600">Remittances, bills</td>
                  <td className="py-4 px-4 text-center text-slate-600">Merchants / small shops</td>
                  <td className="py-4 px-4 text-center text-slate-600">Ticket sales only</td>
                  <td className="py-4 px-4 text-center text-slate-600">International freelancers</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
          <h3 className="font-bold text-slate-800 mb-2">Ready to switch to transparent pricing?</h3>
          <p className="text-slate-600 text-sm">
            Join Bahamian businesses already saving money with KemisPay's honest fee structure.
          </p>
        </div>
      </div>
    </div>
  );
}