import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition"
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
            <p className="text-slate-300 leading-relaxed">
              KemisPay LLC ("we", "us", "our", or "Company"), a subsidiary of Kemis Group of Companies Inc., is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              We may collect information about you in a variety of ways. The information we may collect on the site includes:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Name</li>
              <li>Email Address</li>
              <li>Phone Number</li>
              <li>Payment Information</li>
              <li>Business Information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Use of Your Information</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the site to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Process your transactions and send related information</li>
              <li>Email you regarding your account or order</li>
              <li>Improve our website and services</li>
              <li>Monitor and analyze usage and trends</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Disclosure of Your Information</h2>
            <p className="text-slate-300 leading-relaxed">
              We may share your information with third parties who perform services for us, including payment processors, analytics providers, and customer service platforms. We will not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Security of Your Information</h2>
            <p className="text-slate-300 leading-relaxed">
              We use administrative, technical, and physical security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-slate-300 leading-relaxed">
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mt-4">
              <p className="text-white font-semibold mb-2">KemisPay LLC</p>
              <p className="text-slate-300">Bahamas</p>
              <p className="text-slate-300">A subsidiary of Kemis Group of Companies Inc.</p>
            </div>
          </section>

          <section>
            <p className="text-slate-400 text-sm">
              Last updated: December 2024
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
