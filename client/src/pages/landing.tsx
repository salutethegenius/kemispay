import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import RatesComparison from "@/components/landing/RatesComparison";
import DebitCardDemo from "@/components/landing/DebitCardDemo";
import { Link2, CreditCard, Banknote, ArrowRight } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.5 2A1.5 1.5 0 0 0 8 3.5v1A1.5 1.5 0 0 0 9.5 6h5A1.5 1.5 0 0 0 16 4.5v-1A1.5 1.5 0 0 0 14.5 2h-5zm6.5 4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1 2v2H9V8h6z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800">KemisPay</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollTo("how")}
              className="text-slate-600 hover:text-slate-800 font-medium"
            >
              How it works
            </button>
            <button
              onClick={() => scrollTo("rates")}
              className="text-slate-600 hover:text-slate-800 font-medium"
            >
              Rates
            </button>
            <button
              onClick={() => scrollTo("card")}
              className="text-slate-600 hover:text-slate-800 font-medium"
            >
              Debit Card
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setLocation("/waitlist")}>
              Join waitlist
            </Button>
            <Button onClick={() => setLocation("/login")}>Log in</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
            Accept card payments. Get paid in BSD. No merchant account.
          </h1>
          <p className="text-xl text-slate-600 mb-2 font-medium">
            Exclusively for Bahamian businesses.
          </p>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Share a payment link; your customer pays with a card online; you receive USDC and
            withdraw to your local bank or KemisPay Debit Card.
          </p>
          <Button size="lg" onClick={() => setLocation("/login")} className="px-8">
            Get started
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">
            How it works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: CreditCard,
                title: "Sign up",
                description: "Create your account—no merchant account or bank paperwork required.",
              },
              {
                icon: Link2,
                title: "Create payment link",
                description: "Add a product or service and set the amount. Get a shareable link.",
              },
              {
                icon: Banknote,
                title: "Customer pays with card",
                description: "Your customer opens the link and pays with Visa, Mastercard, etc. online.",
              },
              {
                icon: ArrowRight,
                title: "Get paid",
                description: "Funds land in your balance. Withdraw to your Bahamian bank (1–3 days) or KemisPay Debit Card (instant).",
              },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>
              );
            })}
          </div>
          <p className="text-center mt-8">
            <Button variant="outline" onClick={() => setLocation("/onboarding")}>
              Learn more
            </Button>
          </p>
        </div>
      </section>

      {/* Rates comparison */}
      <section id="rates" className="scroll-mt-20 py-16 px-4 sm:px-6 lg:px-8">
        <RatesComparison showHeading={true} showBottomCta={true} />
      </section>

      {/* Debit card */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <DebitCardDemo />
        </div>
      </section>

      {/* Why KemisPay */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">
            Built for the Bahamas
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "No merchant account",
                description: "Start accepting card payments without bank approvals or lengthy setup.",
              },
              {
                title: "Transparent fees",
                description: "Clear rates: transaction fee, flat wire fee. No hidden charges.",
              },
              {
                title: "Local bank + card",
                description: "Withdraw to your Bahamian bank (1–3 days) or use the KemisPay Debit Card for instant access worldwide.",
              },
              {
                title: "Support that gets you",
                description: "Dedicated support for Bahamian businesses and regulations.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-slate-200 bg-white"
              >
                <h3 className="font-semibold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.5 2A1.5 1.5 0 0 0 8 3.5v1A1.5 1.5 0 0 0 9.5 6h5A1.5 1.5 0 0 0 16 4.5v-1A1.5 1.5 0 0 0 14.5 2h-5zm6.5 4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1 2v2H9V8h6z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-slate-800">KemisPay</span>
              </div>
              <p className="text-slate-600 text-sm">Payments reimagined for the Bahamas.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Quick links</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <button onClick={() => scrollTo("how")} className="hover:text-slate-800">
                    How it works
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo("rates")} className="hover:text-slate-800">
                    Rates
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo("card")} className="hover:text-slate-800">
                    Debit Card
                  </button>
                </li>
                <li>
                  <button onClick={() => setLocation("/login")} className="hover:text-slate-800">
                    Log in
                  </button>
                </li>
                <li>
                  <button onClick={() => setLocation("/waitlist")} className="hover:text-slate-800">
                    Waitlist
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <button onClick={() => setLocation("/privacy")} className="hover:text-slate-800">
                    Privacy
                  </button>
                </li>
                <li>
                  <button onClick={() => setLocation("/terms")} className="hover:text-slate-800">
                    Terms
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-center text-slate-500 text-sm">
            <p>© 2025 KemisPay. Made for the Bahamas. Exclusively for Bahamians.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
