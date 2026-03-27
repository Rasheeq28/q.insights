import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import DatasetCard from "@/components/DatasetCard";
import { MOCK_DATASETS } from "@/lib/mockData";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-slate-dark">
      {/* Hero & Video Section (Side-by-Side) */}
      <section className="bg-brand-slate-dark text-white py-24 lg:py-32 px-4 sm:px-6 lg:px-8 border-b border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
          {/* Left Column: Text Content */}
          <div className="text-left py-8">
            <div className="inline-block px-4 py-1.5 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 text-brand-emerald text-xs font-bold tracking-wider mb-8 uppercase">
              Data Hub for Everyone
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-8 leading-[1.15]">
              High-Quality Data. <br />
              Ready to Use. <br />
              <span className="text-brand-emerald">For Everyone.</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-xl leading-relaxed">
              Access curated datasets that power your vision. From e-commerce and real estate to market intelligence and web-wide data. No scraping required.
            </p>

            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/datasets"
                  className="inline-flex items-center justify-center px-10 py-4.5 border border-transparent text-base font-bold rounded-2xl shadow-[0_0_30px_rgba(204,255,0,0.3)] text-slate-950 bg-brand-emerald hover:bg-brand-emerald-hover hover:scale-105 active:scale-95 transition-all focus:outline-none"
                >
                  Explore Datasets for free
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              
              <div className="flex gap-10 items-center text-sm text-slate-500 font-medium ml-2">
                <div className="flex items-center gap-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-emerald" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  No credit card
                </div>
                <div className="flex items-center gap-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-emerald" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Easy setup
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Video/Placeholder */}
          <div className="relative py-12 lg:py-0">
            <div className="relative aspect-[4/3] w-full max-w-[600px] mx-auto lg:max-w-none rounded-3xl overflow-hidden shadow-[0_48px_96px_-12px_rgba(0,0,0,0.8)] border border-white/10 bg-gradient-to-br from-brand-emerald/10 via-slate-900 to-slate-950 group">
               {/* Video Overlay Placeholder */}
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-6 p-12 opacity-30 group-hover:opacity-50 transition-all duration-700">
                    {[
                      "🌐", "🏠", "🛒", "📊",
                      "📱", "🗺️", "🗄️", "🤖",
                      "✨", "🔗", "🔍", "📁"
                    ].map((icon, i) => (
                      <div key={i} className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner backdrop-blur-sm">
                        {icon}
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-brand-emerald/20 p-6 rounded-strong backdrop-blur-md border border-brand-emerald/40 shadow-2xl group-hover:scale-110 transition-all duration-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-emerald" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
               </div>
               {/* Pause style icon from reference */}
               <div className="absolute bottom-8 left-8 p-2.5 rounded-full border border-white/20 bg-black/20 backdrop-blur-md text-white/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
               </div>
            </div>
            
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-72 h-72 bg-brand-emerald/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Built for the Way You Work */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Built for the Way You Work</h2>
          <p className="text-slate-400">Tailored data solutions for hobbyists, builders, and visionaries.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "For Enthusiasts",
              desc: "Jump straight into discovery. Our datasets are pre-cleaned and ready for your favorite tools.",
              icon: "🎨"
            },
            {
              title: "For Businesses",
              desc: "Get the market intelligence and competitor insights you need to stay ahead.",
              icon: "📈"
            },
            {
              title: "For Developers",
              desc: "Connect via a simple API and start building without the headache of scrapers.",
              icon: "🛠️"
            },
            {
              title: "For AI Companies",
              desc: "Fuel your models with high-quality training data at scale.",
              icon: "🤖"
            }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-brand-emerald/30 transition-all hover:translate-y-[-4px]">
              <div className="text-4xl mb-6">{item.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-emerald/5 border-y border-brand-emerald/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-brand-emerald text-3xl font-bold mb-2">Verified</div>
            <p className="text-slate-300">Hand-checked datasets that just work.</p>
          </div>
          <div>
            <div className="text-brand-emerald text-3xl font-bold mb-2">Instant Connection</div>
            <p className="text-slate-300">Download a simple file or use our easy API.</p>
          </div>
          <div>
            <div className="text-brand-emerald text-3xl font-bold mb-2">Always Current</div>
            <p className="text-slate-300">Daily refreshes so your data is never stale.</p>
          </div>
        </div>
      </section>

      {/* Featured Datasets Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Featured Datasets</h2>
            <p className="text-slate-400">Hand-picked collections updated daily by our data engineers.</p>
          </div>
          <Link href="/datasets" className="text-brand-emerald font-medium hover:text-brand-emerald-hover flex items-center transition-colors">
            See all categories
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_DATASETS.slice(0, 3).map((dataset) => (
            <DatasetCard key={dataset.id} dataset={dataset} />
          ))}
        </div>
      </section>
    </main>
  );
}
