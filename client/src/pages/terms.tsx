import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function Terms() {
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
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Agreement to Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              These Terms of Service constitute a legally binding agreement made between you and KemisPay LLC ("Company", "we", "us", or "our"), a subsidiary of Kemis Group of Companies Inc., concerning your access to and use of the KemisPay website and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Use License</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on KemisPay for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software</li>
              <li>Transmitting or redistributing the materials to any other person or "mirroring" the materials on any other server</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Disclaimer</h2>
            <p className="text-slate-300 leading-relaxed">
              The materials on KemisPay's website are provided on an 'as is' basis. KemisPay makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Limitations</h2>
            <p className="text-slate-300 leading-relaxed">
              In no event shall KemisPay or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on KemisPay's website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Accuracy of Materials</h2>
            <p className="text-slate-300 leading-relaxed">
              The materials appearing on KemisPay's website could include technical, typographical, or photographic errors. KemisPay does not warrant that any of the materials on its website are accurate, complete, or current. KemisPay may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Links</h2>
            <p className="text-slate-300 leading-relaxed">
              KemisPay has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by KemisPay of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Modifications</h2>
            <p className="text-slate-300 leading-relaxed">
              KemisPay may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Governing Law</h2>
            <p className="text-slate-300 leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of the Bahamas, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
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
