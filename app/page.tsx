import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import DatasetCard from "@/components/DatasetCard";
import { MOCK_DATASETS } from "@/lib/mockData";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-slate-dark">
      {/* Hero Section */}
      <section className="bg-brand-slate-dark text-white py-24 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 text-brand-emerald text-xs font-bold tracking-wider mb-8 uppercase">
            Data Science Hub
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8">
            Real-world <span className="text-brand-emerald">datasets</span> for analysis and projects
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Access high-quality, curated datasets from top global platforms to power your next data science project, machine learning model, or market analysis.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/datasets"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.3)] text-slate-950 bg-brand-emerald hover:bg-brand-emerald-hover hover:scale-105 active:scale-95 transition-all focus:outline-none"
            >
              Browse Datasets
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              href="#"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-white/10 text-base font-bold rounded-xl text-white bg-slate-800/50 hover:bg-slate-800 hover:border-white/20 transition-all focus:outline-none"
            >
              View API Docs
            </Link>
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
