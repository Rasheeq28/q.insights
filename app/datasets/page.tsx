import { Suspense } from "react";
import DatasetCard from "@/components/DatasetCard";
import Filters from "@/components/Filters";
import { MOCK_DATASETS } from "@/lib/mockData";

export default function DatasetsPage() {
    return (
        <main className="min-h-screen bg-brand-slate-dark pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">Explore Datasets</h1>
                    <p className="text-xl text-slate-400 max-w-3xl">
                        Browse our collection of premium, structured data from across Bangladesh.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-80 flex-shrink-0">
                        <div className="sticky top-28 space-y-8 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 custom-scrollbar">
                            {/* Filter Section */}
                            <div className="bg-slate-800/40 backdrop-blur-sm p-8 rounded-2xl border border-white/5 shadow-2xl">
                                <Suspense fallback={<div className="h-96 animate-pulse bg-slate-800/50 rounded-xl" />}>
                                    <Filters />
                                </Suspense>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                            {MOCK_DATASETS.map((d) => (
                                <DatasetCard key={d.id} dataset={d} />
                            ))}
                        </div>

                        {/* Pagination Stub */}
                        <div className="mt-16 flex justify-center">
                            <nav className="flex items-center space-x-3">
                                <button className="px-5 py-2.5 border border-white/5 rounded-lg text-sm font-bold text-slate-500 bg-slate-800/30 hover:bg-slate-800/50 transition-all opacity-50 cursor-not-allowed">Previous</button>
                                <button className="h-10 w-10 flex items-center justify-center border border-brand-emerald/30 rounded-lg text-sm font-black text-slate-950 bg-brand-emerald shadow-[0_0_15px_rgba(16,185,129,0.2)]">1</button>
                                <button className="h-10 w-10 flex items-center justify-center border border-white/5 rounded-lg text-sm font-bold text-slate-400 bg-slate-800/30 hover:bg-slate-800/50 transition-all">2</button>
                                <button className="h-10 w-10 flex items-center justify-center border border-white/5 rounded-lg text-sm font-bold text-slate-400 bg-slate-800/30 hover:bg-slate-800/50 transition-all">3</button>
                                <button className="px-5 py-2.5 border border-white/5 rounded-lg text-sm font-bold text-slate-400 bg-slate-800/30 hover:bg-slate-800/50 transition-all">Next &rarr;</button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
