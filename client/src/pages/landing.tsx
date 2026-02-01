import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import RatesComparison from "@/components/landing/RatesComparison";
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
    { label: "Product", id: "how" },
    { label: "Pricing", id: "rates" },
    { label: "Debit Card", id: "card" },
    { label: "Why KemisPay", id: "why" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav — clean, minimal; mobile hamburger */}
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
              Get started
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

      {/* Hero — Paystack-style: one headline, one subline, two CTAs */}
      <section className="relative pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold text-slate-900 tracking-tight leading-[1.15] mb-4 sm:mb-6 px-0 sm:px-2">
            Modern payments for the Bahamas
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 font-normal max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-1">
            KemisPay helps Bahamian businesses get paid by anyone, anywhere—with
            card payments, transparent fees, and payouts to your bank or debit card.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => setLocation("/login")}
              className="w-full sm:w-auto px-8 font-medium"
            >
              Create a free account
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation("/waitlist")}
              className="w-full sm:w-auto px-8 font-medium border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Contact sales
            </Button>
          </div>
          <p className="mt-8 text-sm text-slate-500">
            Built for Bahamian businesses. No merchant account required.
          </p>
        </div>
      </section>

      {/* Simple, easy payments */}
      <section
        id="how"
        className="scroll-mt-16 sm:scroll-mt-20 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/80 border-y border-slate-200/60"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-2 sm:mb-3 tracking-tight">
            Simple, easy payments
          </h2>
          <p className="text-base sm:text-lg text-slate-600 text-center mb-10 sm:mb-14 max-w-xl mx-auto px-1">
            Building a business is hard. Getting paid shouldn&apos;t be.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: CreditCard,
                title: "Sign up",
                description:
                  "Create your account in minutes. No merchant account or bank paperwork.",
              },
              {
                icon: Link2,
                title: "Create a payment link",
                description:
                  "Set your price, get a shareable link. Send it to customers by message or email.",
              },
              {
                icon: Banknote,
                title: "Customer pays with card",
                description:
                  "Your customer opens the link and pays with Visa or Mastercard—securely online.",
              },
              {
                icon: ArrowRight,
                title: "Get paid",
                description:
                  "Funds land in your balance. Withdraw to your bank (1–3 days) or KemisPay Debit Card (instant).",
              },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-base">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-6 left-[calc(50%+2.5rem)] w-8 border-t border-slate-200" />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center mt-10">
            <Button
              variant="outline"
              className="border-slate-300"
              onClick={() => setLocation("/onboarding")}
            >
              Learn more
            </Button>
          </p>
        </div>
      </section>

      {/* Transparent pricing — how it works + rates comparison */}
      <section
        id="rates"
        className="scroll-mt-16 sm:scroll-mt-20 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3 tracking-tight">
              Transparent pricing
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-1">
              Compare KemisPay to other payment options in The Bahamas. We publish
              our fees upfront—no hidden costs.
            </p>
          </div>
          <KemisPayPricing />
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 tracking-tight">
            Compare to other options
          </h3>
          <RatesComparison
            showHeading={false}
            showBottomCta={true}
            onCtaClick={() => setLocation("/login")}
          />
        </div>
      </section>

      {/* Debit card */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/80 border-y border-slate-200/60">
        <div className="max-w-6xl mx-auto">
          <DebitCardDemo />
        </div>
      </section>

      {/* Why KemisPay */}
      <section
        id="why"
        className="scroll-mt-16 sm:scroll-mt-20 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-2 sm:mb-3 tracking-tight">
            Built for the Bahamas
          </h2>
          <p className="text-base sm:text-lg text-slate-600 text-center mb-10 sm:mb-14 max-w-xl mx-auto px-1">
            Payment infrastructure designed for Bahamian businesses and regulations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: Zap,
                title: "No merchant account",
                description:
                  "Start accepting card payments without bank approvals or lengthy setup.",
              },
              {
                icon: Shield,
                title: "Transparent pricing",
                description:
                  "Clear rates: transaction fee plus flat wire fee. No hidden charges.",
              },
              {
                icon: Building2,
                title: "Bank + debit card",
                description:
                  "Withdraw to your Bahamian bank (1–3 days) or use the KemisPay Debit Card for instant access worldwide.",
              },
              {
                icon: HeadphonesIcon,
                title: "Support that gets you",
                description:
                  "Dedicated support for Bahamian businesses and local compliance.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">
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
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 tracking-tight px-1">
            Start accepting payments in minutes
          </h2>
          <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 px-1">
            Create an account, add your first payment link, and get paid—no merchant
            account required.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/95 font-medium px-8"
            onClick={() => setLocation("/login")}
          >
            Create a free account
          </Button>
        </div>
      </section>

      {/* Footer — Paystack-style multi-column */}
      <footer className="bg-slate-900 text-slate-300 py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
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
                Modern payments for the Bahamas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
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
              <h4 className="font-semibold text-white text-sm mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
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
                    onClick={() => setLocation("/waitlist")}
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
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
          <div className="border-t border-slate-700 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} KemisPay. Made for the Bahamas.
            </p>
            <p className="text-sm text-slate-500">
              Exclusively for Bahamian businesses.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
