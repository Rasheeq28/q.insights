import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Q.Labs",
  description: "Simple, transparent pricing. Start free. Upgrade when you grow.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen pt-[160px] bg-[#FAFAFA] text-[#1C1917] font-inter pb-32">
      {/* Header */}
      <section className="px-6 md:px-12 pb-16 flex justify-center">
        <div className="max-w-[800px] w-full text-center flex flex-col items-center">
          <h1 className="font-manrope font-extrabold text-[56px] leading-[1.1] tracking-[-2px] text-[#1C1917] mb-6">
            Pay only for what you use.
          </h1>
          <p className="font-inter text-[20px] leading-[32px] text-[#5B5B5B] max-w-[500px]">
            Simple, transparent pricing for teams of all sizes.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="px-6 md:px-12 flex justify-center">
        <div className="max-w-[880px] w-full grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Free Plan */}
          <div className="bg-white rounded-[40px] border border-[#F0F0F0] p-10 flex flex-col shadow-[0_4px_24px_-12px_rgba(0,0,0,0.05)]">
            <div className="mb-10">
              <h2 className="font-inter font-bold text-[18px] text-[#1C1917] mb-[12px]">Starter</h2>
              <div className="flex items-baseline gap-2">
                <span className="font-manrope font-black text-[56px] tracking-[-3px] text-[#1C1917]">$0</span>
                <span className="font-inter text-[15px] text-[#A8A29E]">/ mo</span>
              </div>
            </div>

            <ul className="flex flex-col gap-5 mb-12 flex-1">
              {[
                "10,000 requests / month",
                "Standard support",
                "CSV / JSON exports",
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="font-inter text-[15px] text-[#5B5B5B]">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="w-full bg-white text-[#1C1917] border border-[#E7E5E4] font-inter font-bold text-[15px] py-[16px] rounded-full flex items-center justify-center hover:border-black transition-colors"
            >
              Start Free
            </Link>
          </div>

          {/* Custom Plan */}
          <div className="bg-white rounded-[40px] border-2 border-[#D1FC00] p-10 flex flex-col shadow-[0_8px_32px_-12px_rgba(209,252,0,0.3)] relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#D1FC00] text-[#4C5D00] font-inter font-black text-[10px] uppercase tracking-[1.5px] px-4 py-1.5 rounded-full">
              Most Popular
            </div>
            <div className="mb-10 mt-2">
              <h2 className="font-inter font-bold text-[18px] text-[#1C1917] mb-[12px]">Enterprise</h2>
              <div className="flex items-baseline gap-2">
                <span className="font-manrope font-black text-[48px] tracking-[-2px] text-[#1C1917]">Custom</span>
              </div>
            </div>

            <ul className="flex flex-col gap-5 mb-12 flex-1">
              {[
                "Unlimited requests",
                "Dedicated account manager",
                "Custom SLAs & pipelines",
                "Priority 24/7 support",
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="font-inter text-[15px] text-[#1C1917] font-medium">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/request"
              className="w-full bg-[#D1FC00] text-[#1C1917] font-inter font-bold text-[15px] py-[16px] rounded-full flex items-center justify-center hover:bg-[#C5ED00] transition-colors"
            >
              Request Custom Scraping
            </Link>
          </div>

        </div>
      </section>

      {/* What's included */}
      <section className="px-6 md:px-12 mt-24 flex justify-center">
        <div className="max-w-[880px] w-full flex flex-col items-center">
            <p className="font-inter font-bold text-[12px] uppercase tracking-[2px] text-[#A8A29E] mb-10">
                What's included in every plan
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                {[
                    "Secure Data Encryption",
                    "Real-time Syncing",
                    "90-day History"
                ].map(feature => (
                    <div key={feature} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-[#D1FC00] rounded-sm flex items-center justify-center shrink-0">
                            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span className="font-inter font-bold text-[15px] text-[#1C1917]">{feature}</span>
                    </div>
                ))}
            </div>
        </div>
      </section>

    </main>
  );
}
