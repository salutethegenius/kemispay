import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function DebitCardDemo() {
  const [, setLocation] = useLocation();

  const handleOrderCard = () => {
    setLocation("/waitlist?interest=debit-card");
  };

  return (
    <section id="card" className="scroll-mt-20 sm:scroll-mt-24">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 sm:gap-16 lg:gap-20">
        {/* Phone + card visual — payment received, instantly to card */}
        <div className="flex-shrink-0 w-full max-w-[380px] sm:max-w-[440px] lg:max-w-[520px]">
          <img
            src="/hero-phone-and-card.png"
            alt="Payment received on KemisPay — instantly deposited to your card"
            className="w-full h-auto rounded-2xl shadow-xl object-contain"
            width={520}
            height={347}
          />
        </div>

        {/* Copy + CTA */}
        <div className="flex-1 w-full max-w-xl text-center lg:text-left px-0 sm:px-2">
          <div className="inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-medium mb-4">
            Coming soon
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4 sm:mb-5">
            KemisPay Debit Card
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mb-6">
            Use your balance with the KemisPay card or send it to your bank. Simple.
          </p>
          <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-slate-600 mb-8 sm:mb-10">
            <li className="flex items-center gap-2 justify-center lg:justify-start">
              <span className="text-primary font-semibold">Money to your card when you want it.</span>
            </li>
            <li className="flex items-center gap-2 justify-center lg:justify-start">
              <span className="text-primary font-semibold">Use it anywhere.</span>
              Shop or withdraw.
            </li>
          </ul>
          <Button size="lg" onClick={handleOrderCard} className="w-full sm:w-auto min-h-[44px] touch-manipulation">
            Join the waitlist
          </Button>
        </div>
      </div>
    </section>
  );
}
