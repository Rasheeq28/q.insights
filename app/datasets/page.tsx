import DatasetCard from "@/components/DatasetCard";
import { MOCK_DATASETS } from "@/lib/mockData";

export default function DatasetsPage() {
    return (
        <main className="min-h-screen bg-brand-slate-dark pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Data Catalog</h1>
                    <p className="text-xl text-slate-400 max-w-3xl">
                        Explore curated datasets. From e-commerce and real estate to market intelligence and web-wide data.
                    </p>
                </div>

                <div className="mb-8 overflow-x-auto pb-4 custom-scrollbar">
                    <div className="flex gap-4">
                        <button className="px-6 py-2 rounded-lg bg-brand-emerald text-slate-950 font-bold whitespace-nowrap shadow-[0_0_15px_rgba(204,255,0,0.2)]">All Categories</button>
                        <button className="px-6 py-2 rounded-lg bg-slate-800 border border-white/5 text-slate-300 font-medium whitespace-nowrap hover:bg-slate-700 transition">E-commerce</button>
                        <button className="px-6 py-2 rounded-lg bg-slate-800 border border-white/5 text-slate-300 font-medium whitespace-nowrap hover:bg-slate-700 transition">Social Media</button>
                        <button className="px-6 py-2 rounded-lg bg-slate-800 border border-white/5 text-slate-300 font-medium whitespace-nowrap hover:bg-slate-700 transition">Financial</button>
                        <button className="px-6 py-2 rounded-lg bg-slate-800 border border-white/5 text-slate-300 font-medium whitespace-nowrap hover:bg-slate-700 transition">Healthcare</button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {MOCK_DATASETS.map((d) => (
                        <DatasetCard key={d.id} dataset={d} />
                    ))}
                </div>

                {/* Pagination Stub */}
                <div className="mt-16 flex justify-center">
                    <nav className="flex items-center gap-2">
                        <button className="h-10 w-10 flex items-center justify-center border border-white/5 rounded-lg text-sm text-slate-500 bg-slate-800/30 hover:bg-slate-800/50 transition-all opacity-50 cursor-not-allowed">&lt;</button>
                        <button className="h-10 w-10 flex items-center justify-center border border-brand-emerald/30 rounded-lg text-sm font-black text-slate-950 bg-brand-emerald shadow-[0_0_15px_rgba(204,255,0,0.2)]">1</button>
                        <button className="h-10 w-10 flex items-center justify-center border border-white/5 rounded-lg text-sm font-bold text-slate-400 bg-slate-800/30 hover:bg-slate-800/50 transition-all">2</button>
                        <button className="h-10 w-10 flex items-center justify-center border border-white/5 rounded-lg text-sm font-bold text-slate-400 bg-slate-800/30 hover:bg-slate-800/50 transition-all">3</button>
                        <span className="text-slate-500 px-2">...</span>
                        <button className="h-10 w-10 flex items-center justify-center border border-white/5 rounded-lg text-sm font-bold text-slate-400 bg-slate-800/30 hover:bg-slate-800/50 transition-all">12</button>
                        <button className="h-10 w-10 flex items-center justify-center border border-white/5 rounded-lg text-sm text-slate-400 bg-slate-800/30 hover:bg-slate-800/50 transition-all">&gt;</button>
                    </nav>
                </div>
            </div>
        </main>
    );
}
