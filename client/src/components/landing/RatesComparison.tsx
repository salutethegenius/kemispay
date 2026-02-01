export default function RatesComparison({
  showHeading = true,
  showBottomCta = true,
  onCtaClick,
}: {
  showHeading?: boolean;
  showBottomCta?: boolean;
  onCtaClick?: () => void;
}) {
  const providers = [
    { name: "KemisPay", highlight: true },
    { name: "Kanoo" },
    { name: "SunCash" },
    { name: "Cash N' Go" },
  ];

  const getCell = (provider: string, field: string) => {
    const map: Record<string, Record<string, string>> = {
      KemisPay: {
        transaction: "~2.5% (card) + 1.5% (platform)",
        wire: "Flat $25 per payout",
        ecommerce: "Full website integration",
        payout: "Instant (card) or 1–3 days (bank)",
        useCase: "Events, services, e‑commerce",
      },
      Kanoo: {
        transaction: "~1.75% (wallet); 1.5%–2% (card/POS)",
        wire: "~$14 transfer (tier-dependent)",
        ecommerce: "Wallet / POS terminals",
        payout: "Same day in-wallet",
        useCase: "P2P, merchants on Kanoo network",
      },
      SunCash: {
        transaction: "3%–5% (send tiers); 2% + 0.50 BSD (card load)",
        wire: "1 BSD (bank withdrawal)",
        ecommerce: "Wallet; ~1% merchant card (varies)",
        payout: "1 BSD to bank; free receive in-wallet",
        useCase: "Remittances, bills, wallet transfers",
      },
      "Cash N' Go": {
        transaction: "4% (merchant card); $0.15 (P2P)",
        wire: "$10 (bank transfer)",
        ecommerce: "Merchant card 4%; wallet / P2P",
        payout: "$10 bank; $3–$5 in-network",
        useCase: "Wallet, P2P, bills, merchant payments",
      },
    };
    return map[provider]?.[field] ?? "—";
  };

  return (
    <div className="max-w-6xl mx-auto">
      {showHeading && (
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
            Transparent pricing
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Compare KemisPay to other payment options in The Bahamas. We publish
            our fees upfront—no hidden costs.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Mobile / small tablet: cards */}
        <div className="md:hidden">
          <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
            {providers.map((provider) => (
              <div
                key={provider.name}
                className={`p-4 sm:p-5 rounded-lg sm:rounded-xl border ${
                  provider.highlight
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 bg-slate-50/50"
                }`}
              >
                <h3
                  className={`font-semibold text-base mb-4 ${
                    provider.highlight ? "text-primary" : "text-slate-800"
                  }`}
                >
                  {provider.name}
                  {provider.highlight && (
                    <span className="ml-2 text-xs font-medium bg-primary text-white px-2.5 py-1 rounded-full">
                      Recommended
                    </span>
                  )}
                </h3>
                <dl className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div>
                    <dt className="font-medium text-slate-700">Transaction fee</dt>
                    <dd className="text-slate-600">{getCell(provider.name, "transaction")}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-700">Bank / wire fee</dt>
                    <dd className="text-slate-600">{getCell(provider.name, "wire")}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-700">E‑commerce</dt>
                    <dd className="text-slate-600">{getCell(provider.name, "ecommerce")}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-700">Payout speed</dt>
                    <dd className="text-slate-600">{getCell(provider.name, "payout")}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-700">Best for</dt>
                    <dd className="text-slate-600">{getCell(provider.name, "useCase")}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>

        {/* Tablet / desktop: table with horizontal scroll on narrow */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider w-48">
                  Feature
                </th>
                <th className="py-4 px-5 font-semibold text-primary bg-primary/5 text-sm text-center min-w-[140px]">
                  KemisPay
                  <div className="text-xs font-normal text-primary mt-1 opacity-90">
                    Recommended
                  </div>
                </th>
                <th className="py-4 px-5 font-semibold text-slate-700 text-sm text-center min-w-[120px]">
                  Kanoo
                </th>
                <th className="py-4 px-5 font-semibold text-slate-700 text-sm text-center min-w-[120px]">
                  SunCash
                </th>
                <th className="py-4 px-5 font-semibold text-slate-700 text-sm text-center min-w-[120px]">
                  Cash N' Go
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-4 px-6 font-medium text-slate-800 text-sm">
                  Transaction fee
                </td>
                <td className="py-4 px-5 text-center bg-primary/5">
                  <span className="font-semibold text-primary">~2.5% + 1.5%</span>
                  <div className="text-xs text-slate-500 mt-0.5">Card + platform (example)</div>
                </td>
                {["Kanoo", "SunCash", "Cash N' Go"].map((p) => (
                  <td key={p} className="py-4 px-5 text-center text-slate-600 text-sm">
                    {getCell(p, "transaction")}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-slate-800 text-sm">
                  Bank transfer / wire fee
                </td>
                <td className="py-4 px-5 text-center bg-primary/5">
                  <span className="font-semibold text-primary">Flat $25 per payout</span>
                  <div className="text-xs text-slate-500 mt-0.5">Batch to save</div>
                </td>
                {["Kanoo", "SunCash", "Cash N' Go"].map((p) => (
                  <td key={p} className="py-4 px-5 text-center text-slate-600 text-sm">
                    {getCell(p, "wire")}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-slate-800 text-sm">
                  E‑commerce integration
                </td>
                <td className="py-4 px-5 text-center bg-primary/5">
                  <span className="font-semibold text-primary">Full website</span>
                  <div className="text-xs text-slate-500 mt-0.5">Pay with card</div>
                </td>
                {["Kanoo", "SunCash", "Cash N' Go"].map((p) => (
                  <td key={p} className="py-4 px-5 text-center text-slate-600 text-sm">
                    {getCell(p, "ecommerce")}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-slate-800 text-sm">
                  Payout speed
                </td>
                <td className="py-4 px-5 text-center bg-primary/5">
                  <span className="font-semibold text-primary">Your choice</span>
                  <div className="text-xs text-slate-500 mt-0.5">Instant or 1–3 days</div>
                </td>
                {["Kanoo", "SunCash", "Cash N' Go"].map((p) => (
                  <td key={p} className="py-4 px-5 text-center text-slate-600 text-sm">
                    {getCell(p, "payout")}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-slate-800 text-sm">
                  Best for
                </td>
                <td className="py-4 px-5 text-center bg-primary/5">
                  <span className="font-semibold text-primary">Events, services, stores</span>
                </td>
                {["Kanoo", "SunCash", "Cash N' Go"].map((p) => (
                  <td key={p} className="py-4 px-5 text-center text-slate-600 text-sm">
                    {getCell(p, "useCase")}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showBottomCta && (
        <div className="text-center mt-6 sm:mt-10 p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-200 max-w-2xl mx-auto">
          <h3 className="font-semibold text-slate-900 mb-1 text-base sm:text-lg">
            Ready for transparent pricing?
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4 px-1">
            Join Bahamian businesses using KemisPay. No hidden fees—just clear rates.
          </p>
          <button
            type="button"
            onClick={onCtaClick ?? (() => (window.location.href = "/login"))}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 sm:px-6 sm:py-2.5 text-sm font-medium text-white hover:opacity-95 transition-opacity min-h-[44px] touch-manipulation"
          >
            Create a free account
          </button>
        </div>
      )}
    </div>
  );
}
