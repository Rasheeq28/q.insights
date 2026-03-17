import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing - Q.Labs",
    description: "Simple, transparent pricing for premium datasets.",
};

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-brand-slate-dark pt-20 pb-32">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-16">
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        Simple, <span className="text-brand-emerald">transparent</span> pricing
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl">
                        Choose the plan that's right for your data needs. No hidden fees, no complexity.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                    {/* Free Plan */}
                    <div className="bg-[#0a0f1a] rounded-2xl p-8 border border-brand-emerald/30 relative shadow-[0_0_30px_rgba(204,255,0,0.05)] h-full flex flex-col">
                        <div className="absolute top-6 right-6 px-3 py-1 bg-brand-emerald text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_10px_rgba(204,255,0,0.4)]">
                            Popular
                        </div>
                        
                        <h2 className="text-2xl font-bold text-white mb-4">Free</h2>
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-6xl font-black text-white">$0</span>
                            <span className="text-slate-500 font-medium">/ month</span>
                        </div>

                        <Link 
                            href="/datasets"
                            className="w-full py-4 bg-brand-emerald hover:bg-brand-emerald-hover text-slate-950 text-base font-black rounded-xl text-center transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:scale-105 active:scale-95 mb-10 inline-block block"
                        >
                            Get Started
                        </Link>

                        <div className="space-y-4 mt-auto">
                            <div className="flex items-start gap-3">
                                <svg className="h-5 w-5 text-brand-emerald shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-slate-300">Access to previews</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <svg className="h-5 w-5 text-brand-emerald shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-slate-300">1000 rows download</span>
                            </div>
                        </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-[#0a0f1a] rounded-2xl p-8 border border-white/5 opacity-80 h-full flex flex-col">
                        <h2 className="text-2xl font-bold text-white mb-4">Pro</h2>
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-4xl font-black text-slate-500">--</span>
                            <span className="text-slate-500 font-medium tracking-wide">coming soon</span>
                        </div>

                        <button 
                            className="w-full py-4 bg-slate-800 text-slate-400 text-base font-bold rounded-xl transition-all hover:bg-slate-700 hover:text-white mb-10"
                        >
                            Notify Me
                        </button>

                        <div className="space-y-4 mt-auto">
                            <div className="flex items-start gap-3 opacity-50">
                                <svg className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <span className="text-slate-400">Full API access</span>
                            </div>
                            <div className="flex items-start gap-3 opacity-50">
                                <svg className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-slate-400">Scraper access</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl">
                    <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
                    
                    <div className="space-y-6">
                        <div className="border-b border-white/5 pb-6">
                            <h3 className="text-lg font-bold text-white mb-3 flex justify-between items-center cursor-pointer group">
                                How do I download data?
                                <svg className="h-5 w-5 text-slate-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </h3>
                            <p className="text-slate-400 leading-relaxed pr-8">
                                In the Free tier, you can download up to 1,000 rows of data directly from the preview pane in CSV format. An account is required to start downloading.
                            </p>
                        </div>
                        
                        <div className="border-b border-white/5 pb-6">
                            <h3 className="text-lg font-bold text-slate-300 mb-0 flex justify-between items-center cursor-pointer group hover:text-white transition-colors">
                                What is included in the API?
                                <svg className="h-5 w-5 text-slate-500 group-hover:text-white transition-colors transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </h3>
                        </div>

                        <div className="border-b border-white/5 pb-6">
                            <h3 className="text-lg font-bold text-slate-300 mb-0 flex justify-between items-center cursor-pointer group hover:text-white transition-colors">
                                When will the Scraper be available?
                                <svg className="h-5 w-5 text-slate-500 group-hover:text-white transition-colors transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
