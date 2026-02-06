export default function KemisPayPricing() {
  return (
    <div className="max-w-3xl mx-auto mb-12 sm:mb-20 px-0 sm:px-2">
      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-5 tracking-tight">
        Our fees
      </h3>
      <p className="text-slate-600 text-sm mb-6 sm:mb-8 min-w-0">
        When a customer pays you, we charge 1.5% plus 1% (2.5% total). Here’s what that looks like on $1,000.
      </p>

      {/* Single scenario: 1.5% transaction + 1% platform, scroll on narrow screens */}
      <div className="overflow-x-auto -mx-1 sm:mx-0 rounded-xl border border-slate-200 bg-white shadow-sm mb-8 sm:mb-10">
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
                KemisPay transaction fee
              </td>
              <td className="py-3 px-3 sm:px-4 text-slate-600 text-xs sm:text-sm text-right">1.5%</td>
              <td className="py-3 px-3 sm:px-4 text-slate-600 text-xs sm:text-sm text-right">$15</td>
            </tr>
            <tr>
              <td className="py-3 px-3 sm:px-4 text-slate-800 text-xs sm:text-sm">KemisPay platform fee</td>
              <td className="py-3 px-3 sm:px-4 text-slate-600 text-xs sm:text-sm text-right">1%</td>
              <td className="py-3 px-3 sm:px-4 text-slate-600 text-xs sm:text-sm text-right">$10</td>
            </tr>
            <tr className="bg-slate-50/50">
              <td className="py-3 px-3 sm:px-4 font-medium text-slate-800 text-xs sm:text-sm">Total fees</td>
              <td className="py-3 px-3 sm:px-4 font-medium text-slate-800 text-xs sm:text-sm text-right">2.5%</td>
              <td className="py-3 px-3 sm:px-4 font-medium text-slate-800 text-xs sm:text-sm text-right">$25</td>
            </tr>
            <tr>
              <td className="py-3 px-3 sm:px-4 font-medium text-primary text-xs sm:text-sm">Net to business owner</td>
              <td className="py-3 px-3 sm:px-4 text-slate-500 text-xs sm:text-sm text-right">-</td>
              <td className="py-3 px-3 sm:px-4 font-semibold text-primary text-xs sm:text-sm text-right">$975</td>
            </tr>
          </tbody>
        </table>
        <p className="px-3 sm:px-4 py-3 text-xs text-slate-500 border-t border-slate-100 bg-slate-50/50 min-w-0">
          On a $1,000 payout, after the 1.5% transaction fee and 1% platform fee, the business owner receives $975.
        </p>
      </div>
    </div>
  );
}
