import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function Terms() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Terms of Use</h1>
        <p className="text-slate-600 mb-10">KemisPay LLC · Effective Date: 1 February 2026</p>

        <div className="prose prose-slate max-w-none space-y-10 text-slate-700">
          <p className="lead text-slate-600">
            These Terms of Use govern your access to and use of the KemisPay platform. By using KemisPay, you agree to these terms.
          </p>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. About KemisPay</h2>
            <p>
              KemisPay is a digital payments and stored value platform that allows users to accept payments, maintain account balances, and request withdrawals. KemisPay is not a bank, does not provide banking services, and does not offer investment or financial advice.
            </p>
            <p className="mt-4">
              <strong>Payment processor.</strong> Customer payments and payouts are processed by Transak (or our named payment partner). Transak is the regulated payment processor for payer identity verification (KYC), AML, sanctions screening, and fund movement. KemisPay is the platform operator and does not perform those regulated functions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Eligibility</h2>
            <p>
              You must be at least 18 years old to use KemisPay. By using the platform, you confirm that you are legally able to enter into this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Account Registration</h2>
            <p className="mb-4">You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Providing accurate information</li>
              <li>Maintaining the security of your login credentials</li>
              <li>All activity that occurs under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Stored Value and Custody</h2>
            <p className="mb-4">Funds credited to your KemisPay account represent stored value. These funds:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Remain your property</li>
              <li>Are held for the purpose of facilitating transactions and withdrawals</li>
              <li>Are not insured or guaranteed by any government agency</li>
            </ul>
            <p>
              KemisPay may use pooled custody mechanisms to securely manage funds while maintaining individual account balances through internal records.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Transactions and Fees</h2>
            <p className="mb-4">
              KemisPay charges platform fees for certain transactions. Fees are disclosed before completion of transactions. External processing fees may apply and are passed through to the user where applicable.
            </p>
            <p className="font-medium">All transactions are final once completed.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Withdrawals</h2>
            <p className="mb-4">Withdrawals are subject to:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Identity verification requirements</li>
              <li>Daily or transaction limits</li>
              <li>Security and risk checks</li>
            </ul>
            <p>
              KemisPay may delay or deny withdrawals where required to prevent fraud, comply with legal obligations, or resolve account issues.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">7. Compliance and Monitoring</h2>
            <p>
              KemisPay reserves the right to monitor activity, request additional information, or suspend accounts to comply with applicable laws and prevent misuse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">8. Prohibited Use</h2>
            <p className="mb-4">You may not use KemisPay for:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Illegal activities</li>
              <li>Fraud or misrepresentation</li>
              <li>Money laundering or terrorist financing</li>
              <li>Circumventing platform controls or limits</li>
            </ul>
            <p>Violation may result in account suspension or termination.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">9. Account Suspension and Termination</h2>
            <p className="mb-4">KemisPay may suspend or terminate accounts for:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Violation of these terms</li>
              <li>Legal or regulatory requirements</li>
              <li>Security or risk concerns</li>
            </ul>
            <p>
              Users may request account closure subject to settlement of any outstanding balances or obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">10. Limitation of Liability</h2>
            <p className="mb-4">KemisPay is not liable for:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Losses caused by user error</li>
              <li>Third party service outages</li>
              <li>Delays caused by external payment networks</li>
              <li>Market fluctuations in digital asset value</li>
            </ul>
            <p>
              To the maximum extent permitted by law, KemisPay&apos;s liability is limited to the amount of fees paid to KemisPay in the previous 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">11. No Investment Services</h2>
            <p>
              KemisPay does not provide investment products, yield, interest, or returns on stored value balances.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">12. Changes to Terms</h2>
            <p>
              We may update these Terms of Use. Continued use of the platform constitutes acceptance of updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">13. Governing Law</h2>
            <p>
              These terms are governed by the laws of the State of Wyoming, United States, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">14. Contact</h2>
            <p className="mb-2">For questions or support, contact:</p>
            <p><a href="mailto:support@kemispay.com" className="text-primary font-medium hover:underline">support@kemispay.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
