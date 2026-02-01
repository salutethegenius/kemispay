import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Phone, User, Check, CreditCard, Zap, Globe, Building2 } from "lucide-react";

const waitlistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
});

type WaitlistForm = z.infer<typeof waitlistSchema>;

export default function Waitlist() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<WaitlistForm>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (data: WaitlistForm) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/waitlist/join", data);
      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.message || "Something went wrong",
          variant: "destructive",
        });
        return;
      }

      setIsSuccess(true);
      form.reset();
      toast({
        title: "You're on the list!",
        description: result.message,
      });
    } catch (error: any) {
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
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
          >
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.5 2A1.5 1.5 0 0 0 8 3.5v1A1.5 1.5 0 0 0 9.5 6h5A1.5 1.5 0 0 0 16 4.5v-1A1.5 1.5 0 0 0 14.5 2h-5zm6.5 4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1 2v2H9V8h6z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900">KemisPay</span>
          </button>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            Back to home
          </Button>
        </div>
      </nav>

      {/* Hero — card-focused */}
      <section className="pt-10 sm:pt-16 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
            <CreditCard className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Get the KemisPay Debit Card
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-xl mx-auto">
            Instant payouts to your card. Use it anywhere in the world—or withdraw to your Bahamian bank. Join the waitlist and we&apos;ll notify you when the card is available.
          </p>

          {!isSuccess ? (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 text-left">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Join the card waitlist</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                              placeholder="Your name"
                              {...field}
                              className="pl-10 bg-white border-slate-200"
                              disabled={isLoading}
                              data-testid="input-name"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                              placeholder="Email address"
                              type="email"
                              {...field}
                              className="pl-10 bg-white border-slate-200"
                              disabled={isLoading}
                              data-testid="input-email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                              placeholder="Phone number"
                              {...field}
                              className="pl-10 bg-white border-slate-200"
                              disabled={isLoading}
                              data-testid="input-phone"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full min-h-[48px] font-medium"
                    disabled={isLoading}
                    data-testid="button-join-waitlist"
                  >
                    {isLoading ? "Joining..." : "Notify me when the card is available"}
                  </Button>
                </form>
              </Form>
              <p className="text-xs text-slate-500 mt-4">No card required to join. We&apos;ll only email you when the KemisPay Debit Card is ready.</p>
            </div>
          ) : (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">You&apos;re on the list!</h2>
              <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                We&apos;ll email you as soon as the KemisPay Debit Card is available. In the meantime, you can start accepting payments with KemisPay.
              </p>
              <Button onClick={() => setLocation("/login")} className="w-full sm:w-auto">
                Go to KemisPay
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Card benefits — short, focused */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-10">
            Why the KemisPay Debit Card?
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Instant payout", description: "Move funds from your KemisPay balance to your card when you want." },
              { icon: Globe, title: "Use anywhere", description: "Shop and withdraw globally—online and in-store." },
              { icon: Building2, title: "Or use your bank", description: "Prefer your local bank? We support 1–3 day payouts too." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.5 2A1.5 1.5 0 0 0 8 3.5v1A1.5 1.5 0 0 0 9.5 6h5A1.5 1.5 0 0 0 16 4.5v-1A1.5 1.5 0 0 0 14.5 2h-5zm6.5 4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1 2v2H9V8h6z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900">KemisPay</span>
          </button>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} KemisPay. Made for the Bahamas.</p>
        </div>
      </footer>
    </div>
  );
}
