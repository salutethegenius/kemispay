export default function RatesComparison({
  showHeading = true,
  showBottomCta = true,
}: {
  showHeading?: boolean;
  showBottomCta?: boolean;
}) {
  const providers = [
    { name: "KemisPay", highlight: true },
    { name: "Kanoo" },
    { name: "SunCash" },
    { name: "Fygaro" },
    { name: "TicketFlare" },
    { name: "PayPal" },
  ];

  const getCell = (provider: string, field: string) => {
    const map: Record<string, Record<string, string>> = {
      KemisPay: {
        transaction: "3.9% + 3% FX",
        wire: "Flat $25 per payout",
        ecommerce: "✅ Full website integration",
        payout: "As soon as you consolidate",
        useCase: "Events, services, stores",
      },
      Kanoo: {
        transaction: "Unclear / varies",
        wire: "Not transparent",
        ecommerce: "❌ Limited / wallet only",
        payout: "Same day in-wallet",
        useCase: "Peer-to-peer transfers",
      },
      SunCash: {
        transaction: "Unclear / varies",
        wire: "Not transparent",
        ecommerce: "❌ Limited / wallet only",
        payout: "Instant in wallet → slower to bank",
        useCase: "Remittances, bills",
      },
      Fygaro: {
        transaction: "~2.5%–3% (via gateway)",
        wire: "Varies by bank",
        ecommerce: "✅ Yes (invoices, stores)",
        payout: "2–5 business days",
        useCase: "Merchants / small shops",
      },
      TicketFlare: {
        transaction: "5% per ticket",
        wire: "Not listed",
        ecommerce: "⚠️ Tickets only",
        payout: "2–5 days after event",
        useCase: "Ticket sales only",
      },
      PayPal: {
        transaction: "~3.49% + FX fee",
        wire: "$5–$15 + FX",
        ecommerce: "✅ Yes (global)",
        payout: "2–7 business days",
        useCase: "International freelancers",
      },
    };
    return map[provider]?.[field] ?? "—";
  };

  return (
    <div className="max-w-6xl mx-auto">
      {showHeading && (
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-3">
            How KemisPay Stacks Up
          </h2>
          <p className="text-lg text-slate-600 mb-4">
            Compare KemisPay to other local payment options in The Bahamas
          </p>
          <div className="inline-block bg-primary/10 rounded-lg px-4 py-2">
            <p className="text-primary font-semibold">
              ✨ Others hide fees. We show them. Others limit you. We integrate you.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        {/* Mobile View */}
        <div className="lg:hidden">
          <div className="p-4 space-y-6">
            {providers.map((provider) => (
              <div
                key={provider.name}
                className={`p-4 rounded-lg border-2 ${
                  provider.highlight ? "border-primary bg-primary/5" : "border-slate-200"
                }`}
              >
                <h3
                  className={`font-bold text-lg mb-3 ${
                    provider.highlight ? "text-primary" : "text-slate-800"
                  }`}
                >
                  {provider.name}
                  {provider.highlight && (
                    <span className="ml-2 text-sm bg-primary text-white px-2 py-1 rounded-full">
                      Best Choice
                    </span>
                  )}
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">Transaction Fees:</span>
                    <div className="text-slate-600">{getCell(provider.name, "transaction")}</div>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Wire Fees:</span>
                    <div className="text-slate-600">{getCell(provider.name, "wire")}</div>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">E-Commerce:</span>
                    <div className="text-slate-600">{getCell(provider.name, "ecommerce")}</div>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Payout Speed:</span>
                    <div className="text-slate-600">{getCell(provider.name, "payout")}</div>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Target Use Case:</span>
                    <div className="text-slate-600">{getCell(provider.name, "useCase")}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Feature</th>
                <th className="text-center py-4 px-4 font-semibold text-primary bg-primary/10">
                  KemisPay
                  <div className="text-xs font-normal text-primary mt-1">Best Choice</div>
                </th>
                <th className="text-center py-4 px-4 font-semibold text-slate-700">Kanoo</th>
                <th className="text-center py-4 px-4 font-semibold text-slate-700">SunCash</th>
                <th className="text-center py-4 px-4 font-semibold text-slate-700">Fygaro</th>
                <th className="text-center py-4 px-4 font-semibold text-slate-700">TicketFlare</th>
                <th className="text-center py-4 px-4 font-semibold text-slate-700">PayPal</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-4 px-6 font-medium text-slate-800">Transaction Fees</td>
                <td className="py-4 px-4 text-center bg-primary/5">
                  <div className="font-semibold text-primary">3.9% + 3% FX</div>
                  <div className="text-xs text-slate-600 mt-1">Transparent pricing</div>
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("Kanoo", "transaction")}
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("SunCash", "transaction")}
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("Fygaro", "transaction")}
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("TicketFlare", "transaction")}
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("PayPal", "transaction")}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-4 px-6 font-medium text-slate-800">Bank Transfer / Wire Fees</td>
                <td className="py-4 px-4 text-center bg-primary/5">
                  <div className="font-semibold text-primary">Flat $25 per payout</div>
                  <div className="text-xs text-slate-600 mt-1">Batch monthly</div>
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("Kanoo", "wire")}
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("SunCash", "wire")}
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("Fygaro", "wire")}
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("TicketFlare", "wire")}
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("PayPal", "wire")}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-4 px-6 font-medium text-slate-800">E-Commerce Integration</td>
                <td className="py-4 px-4 text-center bg-primary/5">
                  <div className="font-semibold text-green-600">✅ Full website plugin</div>
                  <div className="text-xs text-slate-600 mt-1">Pay with card via Transak</div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="font-semibold text-red-600">❌ Limited</div>
                  <div className="text-xs text-slate-600 mt-1">Wallet only</div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="font-semibold text-red-600">❌ Limited</div>
                  <div className="text-xs text-slate-600 mt-1">Wallet only</div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="font-semibold text-green-600">✅ Yes</div>
                  <div className="text-xs text-slate-600 mt-1">Invoices, stores</div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="font-semibold text-orange-600">⚠️ Tickets only</div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="font-semibold text-green-600">✅ Yes</div>
                  <div className="text-xs text-slate-600 mt-1">Global</div>
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-4 px-6 font-medium text-slate-800">Payout Speed</td>
                <td className="py-4 px-4 text-center bg-primary/5">
                  <div className="font-semibold text-primary">As soon as you consolidate</div>
                  <div className="text-xs text-slate-600 mt-1">Your choice</div>
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("Kanoo", "payout")}
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("SunCash", "payout")}
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("Fygaro", "payout")}
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("TicketFlare", "payout")}
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("PayPal", "payout")}
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-medium text-slate-800">Target Use Case</td>
                <td className="py-4 px-4 text-center bg-primary/5">
                  <div className="font-semibold text-primary">Events, services, stores</div>
                  <div className="text-xs text-slate-600 mt-1">Full flexibility</div>
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("Kanoo", "useCase")}
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("SunCash", "useCase")}
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("Fygaro", "useCase")}
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("TicketFlare", "useCase")}
                </td>
                <td className="py-4 px-4 text-center text-slate-600">
                  {getCell("PayPal", "useCase")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showBottomCta && (
        <div className="text-center mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
          <h3 className="font-bold text-slate-800 mb-2">Ready to switch to transparent pricing?</h3>
          <p className="text-slate-600 text-sm">
            Join Bahamian businesses already saving money with KemisPay's honest fee structure.
          </p>
        </div>
      )}
    </div>
  );
}
