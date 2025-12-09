import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Phone, User, Check } from "lucide-react";

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
  const featuresRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

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
          description: result.message || "Failed to join waitlist",
          variant: "destructive",
        });
        return;
      }

      setIsSuccess(true);
      form.reset();
      toast({
        title: "Success!",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.5 2A1.5 1.5 0 0 0 8 3.5v1A1.5 1.5 0 0 0 9.5 6h5A1.5 1.5 0 0 0 16 4.5v-1A1.5 1.5 0 0 0 14.5 2h-5zm6.5 4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1 2v2H9V8h6z" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl">KemisPay</span>
          </div>
          <Button 
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            data-testid="button-request-access"
          >
            Request Early Access
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Transform Payments for the Bahamas
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 mb-12 leading-relaxed max-w-2xl mx-auto">
            Accept payments without a merchant account. KemisPay is coming to revolutionize how Bahamian businesses get paid.
          </p>

          {!isSuccess ? (
            <div className="max-w-2xl mx-auto">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                              <Input
                                placeholder="Your name"
                                {...field}
                                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-white focus-visible:ring-blue-500"
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
                              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                              <Input
                                placeholder="Your email"
                                type="email"
                                {...field}
                                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-white focus-visible:ring-blue-500"
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
                              <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                              <Input
                                placeholder="Phone number"
                                {...field}
                                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-white focus-visible:ring-blue-500"
                                disabled={isLoading}
                                data-testid="input-phone"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3"
                    disabled={isLoading}
                    data-testid="button-join-waitlist"
                  >
                    {isLoading ? "Joining..." : "Join the Waitlist"}
                  </Button>
                </form>
              </Form>
              <p className="text-sm text-slate-400 mt-4">No credit card required. We'll notify you as soon as we launch.</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">You're In!</h2>
              <p className="text-slate-300 mb-4">
                Check your email for a confirmation message. We'll let you know as soon as KemisPay is ready.
              </p>
              <Button
                variant="outline"
                onClick={() => setIsSuccess(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-700"
                data-testid="button-join-another"
              >
                Join with Another Email
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Why KemisPay?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "⚡",
                title: "Instant Settlements",
                description: "Get paid faster without waiting for merchant account approvals",
              },
              {
                icon: "🌍",
                title: "Local Currency Support",
                description: "Accept payments in BSD and other currencies Bahamians use",
              },
              {
                icon: "🔒",
                title: "Advanced Security",
                description: "Bank-level encryption and security for your customers' peace of mind",
              },
              {
                icon: "📱",
                title: "Mobile-First Design",
                description: "Seamless experience on phones, tablets, and desktops",
              },
              {
                icon: "💬",
                title: "Caribbean Support",
                description: "Dedicated support team that understands your business",
              },
              {
                icon: "✨",
                title: "Transparent Pricing",
                description: "No hidden fees. Simple, honest rates you can count on",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-slate-800 rounded-xl p-8 border border-slate-700 hover:border-blue-500 transition-colors"
                data-testid={`feature-card-${i}`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section ref={trustRef} className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Built for the Bahamas</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: "🛡️", title: "Bank-Level Security", description: "Your data is encrypted and protected" },
              { icon: "✅", title: "Locally Regulated", description: "Compliant with Bahamian requirements" },
              { icon: "🤝", title: "Local Support", description: "Real people, real support in your timezone" },
              { icon: "📈", title: "Growing Network", description: "Join thousands of Bahamian businesses" },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700" data-testid={`trust-item-${i}`}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.5 2A1.5 1.5 0 0 0 8 3.5v1A1.5 1.5 0 0 0 9.5 6h5A1.5 1.5 0 0 0 16 4.5v-1A1.5 1.5 0 0 0 14.5 2h-5zm6.5 4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1 2v2H9V8h6z" />
                  </svg>
                </div>
                <span className="text-white font-bold">KemisPay</span>
              </div>
              <p className="text-slate-400 text-sm">Payments reimagined for the Bahamas</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <button 
                    onClick={() => trustRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-white transition text-left"
                    data-testid="link-why-kemispay"
                  >
                    Why KemisPay
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-white transition text-left"
                    data-testid="link-local"
                  >
                    Local
                  </button>
                </li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <button 
                    onClick={() => setLocation('/privacy')}
                    className="hover:text-white transition text-left"
                    data-testid="link-privacy"
                  >
                    Privacy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLocation('/terms')}
                    className="hover:text-white transition text-left"
                    data-testid="link-terms"
                  >
                    Terms
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-slate-500 text-sm">
            <p>© 2025 KemisPay LLC, a subsidiary of Kemis Group of Companies Inc. Made for the Bahamas 🇧🇸</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
