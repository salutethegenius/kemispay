import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function Privacy() {
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
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-600 mb-10">KemisPay LLC · Effective Date: 1 February 2026</p>

        <div className="prose prose-slate max-w-none space-y-10 text-slate-700">
          <p className="lead text-slate-600">
            KemisPay LLC, a subsidiary of Kemis Group of Companies Inc., values your privacy. This Privacy Policy explains how we collect, use, store, and protect your information when you use the KemisPay platform, website, and services.
          </p>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
            <p className="mb-4">We collect the following types of information:</p>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">a. Personal Information</h3>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Date of birth</li>
              <li>Government issued identification when required for identity verification</li>
              <li>Address information when required for withdrawals or card issuance</li>
            </ul>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">b. Financial and Account Information</h3>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Transaction history within KemisPay</li>
              <li>Wallet balances and withdrawal requests</li>
              <li>Linked payment methods used for funding or withdrawals</li>
            </ul>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">c. Technical Information</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>IP address</li>
              <li>Device and browser type</li>
              <li>Log data related to platform usage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Create and manage your KemisPay account</li>
              <li>Process transactions and maintain accurate account balances</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Prevent fraud and unauthorized activity</li>
              <li>Communicate important service related updates</li>
              <li>Improve platform performance and user experience</li>
            </ul>
            <p className="font-medium">We do not sell your personal information.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Custody and Storage of Funds</h2>
            <p>
              KemisPay provides access to stored value services. Funds held in KemisPay accounts are represented as digital balances and remain the property of the user at all times. KemisPay does not use customer funds for its own operating expenses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. KYC and Identity Verification</h2>
            <p>
              When required, we collect identity documents to comply with legal, compliance, and risk management requirements. These documents are securely stored using third party encrypted storage providers and are only accessed when necessary.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Data Storage and Security</h2>
            <p>
              We use reasonable administrative, technical, and physical safeguards to protect your data. While no system is completely secure, we implement industry standard practices to minimize risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Sharing of Information</h2>
            <p className="mb-4">We may share information with:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Service providers that support our operations such as payment processors and compliance providers</li>
              <li>Legal or regulatory authorities if required by law</li>
              <li>Third parties in connection with fraud prevention or platform security</li>
            </ul>
            <p className="font-medium">We do not share information for marketing purposes without consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">7. Data Retention</h2>
            <p>
              We retain personal and financial information only as long as necessary to provide services and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">8. Your Rights</h2>
            <p>
              You may request access, correction, or deletion of your personal data where legally permitted by contacting support@kemispay.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Updates will be posted on our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">10. Contact</h2>
            <p className="mb-2">For privacy related questions, contact:</p>
            <p><a href="mailto:support@kemispay.com" className="text-primary font-medium hover:underline">support@kemispay.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
