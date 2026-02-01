import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function DebitCardDemo() {
  const [, setLocation] = useLocation();

  const handleOrderCard = () => {
    setLocation("/waitlist?interest=debit-card");
  };

  return (
    <section id="card" className="scroll-mt-20">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
        {/* Demo card visual - CSS-only */}
        <div
          className="w-full max-w-[320px] sm:max-w-[380px] aspect-[1.586/1] rounded-2xl shadow-xl flex-shrink-0 bg-gradient-to-br from-primary via-primary to-slate-800 border border-primary/30"
        >
          <div className="h-full p-6 sm:p-8 flex flex-col justify-between text-white">
            {/* Top row: chip + logo */}
            <div className="flex items-start justify-between">
              <div className="w-12 h-9 rounded-md bg-amber-400/90" aria-hidden />
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.5 2A1.5 1.5 0 0 0 8 3.5v1A1.5 1.5 0 0 0 9.5 6h5A1.5 1.5 0 0 0 16 4.5v-1A1.5 1.5 0 0 0 14.5 2h-5zm6.5 4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1 2v2H9V8h6z" />
                </svg>
              </div>
            </div>
            {/* Card number */}
            <div className="tracking-[0.25em] text-lg sm:text-xl font-mono font-medium">
              •••• •••• •••• 4242
            </div>
            {/* Bottom row */}
            <div className="flex justify-between items-end text-sm text-white/90">
              <div>
                <div className="text-[10px] uppercase tracking-wider">Valid Thru</div>
                <div className="font-mono">12/28</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider">Cardholder</div>
                <div className="font-medium">KEMISPAY</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider">Debit</div>
                <div className="font-semibold">KEMISPAY</div>
              </div>
            </div>
          </div>
        </div>

        {/* Copy + CTA */}
        <div className="flex-1 max-w-xl text-center lg:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
            Order your KemisPay Debit Card today!
          </h2>
          <ul className="space-y-3 text-slate-600 mb-6">
            <li className="flex items-center gap-2 justify-center lg:justify-start">
              <span className="text-primary font-semibold">Instant payout</span>
              — funds to your card when you choose.
            </li>
            <li className="flex items-center gap-2 justify-center lg:justify-start">
              <span className="text-primary font-semibold">Use anywhere in the world</span>
              — shop and withdraw globally.
            </li>
          </ul>
          <p className="text-slate-600 mb-6">
            Prefer your local bank? We support that too—{" "}
            <strong className="text-slate-800">local bank payouts typically arrive in 1–3 business days</strong>.
          </p>
          <Button size="lg" onClick={handleOrderCard} className="w-full sm:w-auto">
            Order your card
          </Button>
        </div>
      </div>
    </section>
  );
}
