import { Info } from "lucide-react";

export default function KemisPayPricing() {
  return (
    <div className="max-w-3xl mx-auto mb-10 sm:mb-16 px-0 sm:px-2">
      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 sm:mb-4 tracking-tight">
        How KemisPay pricing works
      </h3>
      <p className="text-slate-600 text-sm mb-4 sm:mb-6 min-w-0">
        When a customer pays with a card, fees include the KemisPay card fee
        and your KemisPay platform fee. Below is an example on a $1,000 payment.
      </p>

      {/* Combined example table — scroll on narrow screens */}
      <div className="overflow-x-auto -mx-1 sm:mx-0 rounded-xl border border-slate-200 bg-white shadow-sm mb-6 sm:mb-8">
        <table className="w-full min-w-[280px] text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="py-3 px-3 sm:px-4 font-semibold text-slate-700 text-xs sm:text-sm">
                Component
              </th>
              <th className="py-3 px-3 sm:px-4 font-semibold text-slate-700 text-xs sm:text-sm w-20 sm:w-24 text-right">
                %
              </th>
              <th className="py-3 px-3 sm:px-4 font-semibold text-slate-700 text-xs sm:text-sm w-24 sm:w-28 text-right">
                USD amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-3 px-3 sm:px-4 text-slate-800 text-xs sm:text-sm">
                KemisPay card fee
              </td>
              <td className="py-3 px-3 sm:px-4 text-slate-600 text-xs sm:text-sm text-right">~2.5%</td>
              <td className="py-3 px-3 sm:px-4 text-slate-600 text-xs sm:text-sm text-right">$25</td>
            </tr>
            <tr>
              <td className="py-3 px-3 sm:px-4 text-slate-800 text-xs sm:text-sm">KemisPay platform fee</td>
              <td className="py-3 px-3 sm:px-4 text-slate-600 text-xs sm:text-sm text-right">1.5%</td>
              <td className="py-3 px-3 sm:px-4 text-slate-600 text-xs sm:text-sm text-right">$15</td>
            </tr>
            <tr className="bg-slate-50/50">
              <td className="py-3 px-3 sm:px-4 font-medium text-slate-800 text-xs sm:text-sm">Total fees</td>
              <td className="py-3 px-3 sm:px-4 font-medium text-slate-800 text-xs sm:text-sm text-right">~4.0%</td>
              <td className="py-3 px-3 sm:px-4 font-medium text-slate-800 text-xs sm:text-sm text-right">$40</td>
            </tr>
            <tr>
              <td className="py-3 px-3 sm:px-4 font-medium text-primary text-xs sm:text-sm">Net credited to user account</td>
              <td className="py-3 px-3 sm:px-4 text-slate-500 text-xs sm:text-sm text-right">—</td>
              <td className="py-3 px-3 sm:px-4 font-semibold text-primary text-xs sm:text-sm text-right">$960</td>
            </tr>
          </tbody>
        </table>
        <p className="px-3 sm:px-4 py-3 text-xs text-slate-500 border-t border-slate-100 bg-slate-50/50 min-w-0">
          So on a $1,000 payment, after the card fee and your platform fee,
          the user&apos;s USDC balance inside KemisPay would be about $960 in
          this example.
        </p>
      </div>

      {/* Flexibility bullets */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 space-y-3 sm:space-y-4">
        <div className="flex gap-3 min-w-0">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-700 min-w-0">
            <strong className="text-slate-900">KemisPay card fee can be lower</strong>{" "}
            if the customer pays via bank transfer or other low-cost methods.
          </p>
        </div>
        <div className="flex gap-3 min-w-0">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-700 min-w-0">
            <strong className="text-slate-900">Your platform fee is flexible</strong>{" "}
            — you set it. 1.5% is a strong baseline that keeps you competitive.
          </p>
        </div>
        <div className="flex gap-3 min-w-0">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-700 min-w-0">
            <strong className="text-slate-900">You choose how to pass costs</strong>{" "}
            — pass the card fee fully to the user, partially absorb it, or
            wrap it into the posted price.
          </p>
        </div>
        <div className="flex gap-3 min-w-0">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-700 min-w-0">
            <strong className="text-slate-900">These fees apply at payment</strong>{" "}
            — before any withdrawal or payout fees that might apply later.
          </p>
        </div>
      </div>
    </div>
  );
}
