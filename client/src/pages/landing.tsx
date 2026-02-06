import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import KemisPayPricing from "@/components/landing/KemisPayPricing";
import DebitCardDemo from "@/components/landing/DebitCardDemo";
import {
  Link2,
  CreditCard,
  Banknote,
  ArrowRight,
  Shield,
  Zap,
  Building2,
  HeadphonesIcon,
  Menu,
  X,
} from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "How it works", id: "how" },
    { label: "Pricing", id: "rates" },
    { label: "Debit Card", id: "card" },
    { label: "Why KemisPay", id: "why" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav: clean, minimal; mobile hamburger */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M9.5 2A1.5 1.5 0 0 0 8 3.5v1A1.5 1.5 0 0 0 9.5 6h5A1.5 1.5 0 0 0 16 4.5v-1A1.5 1.5 0 0 0 14.5 2h-5zm6.5 4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1 2v2H9V8h6z" />
              </svg>
            </div>
            <span className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight truncate">
              KemisPay
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-900 hidden md:inline-flex"
              onClick={() => setLocation("/login")}
            >
              Log in
            </Button>
            <Button size="sm" onClick={() => setLocation("/login")} className="flex-shrink-0">
              Create account
            </Button>
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors touch-manipulation"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 bg-white">
            <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-left py-3 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 touch-manipulation"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => { setMobileMenuOpen(false); setLocation("/login"); }}
                className="text-left py-3 px-3 rounded-lg text-sm font-medium text-primary hover:bg-primary/5 touch-manipulation"
              >
                Log in
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero: obvious, calm, trustworthy + relatable visual */}
      <section className="relative pt-16 sm:pt-20 lg:pt-28 pb-20 sm:pb-28 lg:pb-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Vector lines connecting headline to image */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="hero-line-grad" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="hero-line-grad-2" x1="0" y1="1" x2="1" y2="0" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Curved line from left (headline) toward right (image) */}
          <path d="M 0 28 Q 35 22, 52 38 T 100 45" fill="none" stroke="url(#hero-line-grad)" strokeWidth="0.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d="M 0 32 Q 40 28, 58 42 T 100 50" fill="none" stroke="url(#hero-line-grad)" strokeWidth="0.25" strokeLinecap="round" strokeDasharray="1 2" vectorEffect="non-scaling-stroke" />
          {/* Diagonal accent lines */}
          <line x1="0" y1="38" x2="48" y2="35" stroke="url(#hero-line-grad)" strokeWidth="0.25" strokeLinecap="round" opacity="0.7" vectorEffect="non-scaling-stroke" />
          <line x1="55" y1="48" x2="100" y2="42" stroke="url(#hero-line-grad-2)" strokeWidth="0.3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d="M 8 24 Q 30 30, 45 28" fill="none" stroke="var(--primary)" strokeWidth="0.2" strokeLinecap="round" opacity="0.2" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
            <div className="flex-1 text-center lg:text-left order-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold text-slate-900 tracking-tight leading-[1.15] mb-6 sm:mb-8 px-0 sm:px-2 relative">
                Get Paid Fast in The Bahamas
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 font-normal max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed px-1">
                KemisPay lets customers pay your business and puts the money straight onto your card or bank. No complicated setup. No waiting weeks.
              </p>
              <p className="text-base text-slate-600 max-w-xl mx-auto lg:mx-0 mb-10">
                Made for Bahamian businesses, from food vendors to online sellers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  size="lg"
                  onClick={() => setLocation("/login")}
                  className="w-full sm:w-auto px-8 font-medium"
                >
                  Create Free Account
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setLocation("/waitlist?interest=debit-card")}
                  className="w-full sm:w-auto px-8 font-medium border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Join Debit Card Waitlist
                </Button>
              </div>
              <p className="mt-10 text-sm text-slate-500">
                Safe, simple payments. No merchant account needed.
              </p>
            </div>
            <div className="flex-1 flex justify-center lg:justify-end order-2 w-full max-w-lg lg:max-w-xl">
              <img
                src="/hero-payment-received.png"
                alt="Payment received on phone — money deposited to your card"
                className="w-full max-w-[380px] sm:max-w-[440px] lg:max-w-[520px] xl:max-w-[560px] h-auto rounded-2xl shadow-2xl object-cover ring-2 ring-white/50"
                width={560}
                height={747}
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works — gradient blue, white copy, slides down */}
      <section
        id="how"
        className="scroll-mt-20 sm:scroll-mt-24 py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary via-primary to-slate-800"
      >
        <div className="max-w-5xl mx-auto animate-slide-down">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4 sm:mb-5 tracking-tight">
            How it works
          </h2>
          <p className="text-base sm:text-lg text-white/90 text-center mb-14 sm:mb-20 max-w-xl mx-auto px-1">
            Someone pays you. The money goes to your card or bank. You use it when you need it.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
            {[
              {
                icon: CreditCard,
                title: "Sign up",
                description:
                  "Create your account. No paperwork, no merchant account.",
              },
              {
                icon: Link2,
                title: "Get a payment link",
                description:
                  "Set your price. Send the link to your customer by text or email.",
              },
              {
                icon: Banknote,
                title: "They pay",
                description:
                  "Your customer opens the link and pays with card. Done.",
              },
              {
                icon: ArrowRight,
                title: "You get the money",
                description:
                  "The money goes to your balance. Use your card or send it to your bank.",
              },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-3 text-base">
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/85 leading-relaxed">
                    {step.description}
                  </p>
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-6 left-[calc(50%+2.5rem)] w-8 border-t border-white/30" />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center mt-16">
            <Button
              variant="secondary"
              className="bg-white text-primary hover:bg-white/95 font-medium border-0"
              onClick={() => setLocation("/login")}
            >
              Create Free Account
            </Button>
          </p>
        </div>
      </section>

      {/* Why KemisPay — with real business owner */}
      <section
        id="why"
        className="scroll-mt-20 sm:scroll-mt-24 py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
            <div className="flex-shrink-0 w-full max-w-sm lg:max-w-md order-1 lg:order-1">
              <img
                src="/why-business-owner.png"
                alt="Business owner in his shop, checking his phone — get paid and run your day"
                className="w-full h-auto rounded-2xl shadow-lg object-cover"
                width={440}
                height={580}
              />
            </div>
            <div className="flex-1 order-2 lg:order-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 sm:mb-5 tracking-tight text-center lg:text-left">
                Why Bahamian businesses use KemisPay
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mb-10 sm:mb-14 max-w-xl mx-auto lg:mx-0 text-center lg:text-left px-1">
                You get paid. The money goes to your card or bank. No waiting weeks.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {[
                  {
                    icon: Zap,
                    title: "Money when you need it",
                    description:
                      "When someone pays you, the money shows up. Use it today.",
                  },
                  {
                    icon: Shield,
                    title: "Clear fees",
                    description:
                      "You see the fees upfront. No surprises.",
                  },
                  {
                    icon: Building2,
                    title: "Your card or your bank",
                    description:
                      "Send money to your KemisPay card or your Bahamian bank.",
                  },
                  {
                    icon: HeadphonesIcon,
                    title: "Real support",
                    description:
                      "Help when you need it. We're here for Bahamian businesses.",
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      className="p-8 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="rates"
        className="scroll-mt-20 sm:scroll-mt-24 py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 sm:mb-5 tracking-tight">
              Clear pricing
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-1">
              See our fees. Compare to other options in The Bahamas. No hidden costs.
            </p>
          </div>
          <KemisPayPricing />
          <div className="mt-16 flex justify-center">
            <img
              src="/compare-made-for-bahamians.png"
              alt="How we compare — Made for Bahamians. KemisPay vs Kanoo, SunCash, Cash N' Go: transaction fees, wire fees, e-commerce, payout speed."
              className="w-full max-w-2xl lg:max-w-4xl h-auto rounded-xl shadow-lg object-contain"
              width={900}
              height={600}
            />
          </div>
          <p className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => setLocation("/login")}
              className="font-medium"
            >
              Create Free Account
            </Button>
          </p>
        </div>
      </section>

      {/* Debit card */}
      <section className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-50/80 border-y border-slate-200/60">
        <div className="max-w-6xl mx-auto">
          <DebitCardDemo />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-5 sm:mb-6 tracking-tight px-1">
            Get paid fast. Use your money today.
          </h2>
          <p className="text-base sm:text-lg text-white/90 mb-10 sm:mb-12 px-1">
            Join Bahamian businesses who get paid and get their money on their card or bank. Safe and simple. No merchant account needed.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/95 font-medium px-8"
            onClick={() => setLocation("/login")}
          >
            Create Free Account
          </Button>
        </div>
      </section>

      {/* Footer: multi-column */}
      <footer className="bg-slate-900 text-slate-300 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 sm:gap-14 mb-14 sm:mb-20">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path d="M9.5 2A1.5 1.5 0 0 0 8 3.5v1A1.5 1.5 0 0 0 9.5 6h5A1.5 1.5 0 0 0 16 4.5v-1A1.5 1.5 0 0 0 14.5 2h-5zm6.5 4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1 2v2H9V8h6z" />
                  </svg>
                </div>
                <span className="text-white font-semibold">KemisPay</span>
              </div>
              <p className="text-sm text-slate-400">
                Get paid. Get your money on your card or bank. Made for Bahamian businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-5">Product</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <button
                    onClick={() => scrollTo("how")}
                    className="hover:text-white transition-colors"
                  >
                    How it works
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("rates")}
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("card")}
                    className="hover:text-white transition-colors"
                  >
                    Debit Card
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLocation("/login")}
                    className="hover:text-white transition-colors"
                  >
                    Log in
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-5">Support</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <button
                    onClick={() => setLocation("/support")}
                    className="hover:text-white transition-colors"
                  >
                    Help
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLocation("/waitlist?interest=debit-card")}
                    className="hover:text-white transition-colors"
                  >
                    Join Debit Card Waitlist
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-5">Legal</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <button
                    onClick={() => setLocation("/privacy")}
                    className="hover:text-white transition-colors"
                  >
                    Privacy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLocation("/terms")}
                    className="hover:text-white transition-colors"
                  >
                    Terms
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-10 sm:pt-12 space-y-4">
            <p className="text-sm text-slate-500 text-center sm:text-left">
              Customer payments and payouts are processed by Transak. Transak is the regulated payment processor; KemisPay is the platform operator.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
              <p className="text-sm text-slate-500">
                © {new Date().getFullYear()} KemisPay. Simple payments for Bahamian businesses.
              </p>
              <p className="text-sm text-slate-500">
                Get your money without the wait.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
