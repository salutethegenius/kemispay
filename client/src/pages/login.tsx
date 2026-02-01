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
import RatesComparison from "@/components/landing/RatesComparison";

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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 py-8 sm:py-12">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-3 sm:space-y-4 px-4 sm:px-6 pt-6 sm:pt-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.5 2A1.5 1.5 0 0 0 8 3.5v1A1.5 1.5 0 0 0 9.5 6h5A1.5 1.5 0 0 0 16 4.5v-1A1.5 1.5 0 0 0 14.5 2h-5zm6.5 4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1 2v2H9V8h6z"/>
              </svg>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">KemisPay</CardTitle>
          </div>
          <p className="text-sm sm:text-base text-slate-600">You don&apos;t even need a merchant account. Accept payments like a pro.</p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
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
                className="w-full min-h-[44px] touch-manipulation" 
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
      <div className="mt-8 sm:mt-12 w-full max-w-6xl mx-auto px-0 sm:px-4">
        <RatesComparison showHeading={true} showBottomCta={true} />
      </div>
    </div>
  );
}