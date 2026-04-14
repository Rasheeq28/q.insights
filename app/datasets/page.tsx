"use client";
import { useState, useEffect } from "react";
import DatasetCard from "@/components/DatasetCard";
import { supabase } from "@/lib/supabase";
import { Dataset } from "@/lib/types";
import Link from "next/link";

export default function DatasetsPage() {
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDatasets = async () => {
            const { data, error } = await supabase.from("datasets").select("*").eq("is_active", true);
            if (data) {
                const mapped = data.map(d => ({
                    ...d,
                    previewData: d.preview_data,
                    updatedAt: d.updated_at ? new Date(d.updated_at).toLocaleDateString() : "Live"
                }));
                // Filter to only include finance and real estate for now based on user's instruction
                const specificDatasets = mapped.filter(d => 
                    d.tags?.some((t: string) => t.toLowerCase() === 'finance' || t.toLowerCase() === 'real estate')
                );
                // If there are specific datasets matching, use them, otherwise show everything for demo purposes
                setDatasets(specificDatasets.length > 0 ? specificDatasets as any : mapped as any);
            }
            setLoading(false);
        };
        fetchDatasets();
    }, []);
    
    // User specifically asked for just Finance and Real Estate
    const filters = ["All", "Finance", "Real Estate"];

    const filteredDatasets = datasets.filter(d => {
        const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) || 
                              d.description.toLowerCase().includes(search.toLowerCase());
                              
        const matchesFilter = activeFilter === "All" || 
                              (d.tags && Array.isArray(d.tags) && d.tags.some(tag => tag.toLowerCase() === activeFilter.toLowerCase()));
                              
        return matchesSearch && matchesFilter;
    });

    return (
        <main className="min-h-screen pt-[160px] font-inter bg-[#FAFAFA] pb-24 text-[#1C1917]">
            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <section className="flex flex-col items-center px-6 md:px-12 gap-6 max-w-[800px] mx-auto text-center mb-[80px]">
                <h1 className="font-manrope font-extrabold text-[56px] md:text-[72px] leading-[1.05] tracking-[-2.5px] text-[#1C1917]">
                    The Data <span className="bg-[#D1FC00] px-4 py-1 pb-2">Catalog.</span>
                </h1>
                <p className="font-inter text-[18px] text-[#5B5B5B] max-w-[600px] leading-[30px]">
                    Premium datasets curated for precision. Simple, clean, and ready for your next project.
                </p>

                {/* Pill Search Bar */}
                <div className="w-full mt-6 relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-40">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search datasets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-[64px] bg-[#F6F6F6] rounded-full pl-[56px] pr-8 text-[16px] text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-black/10 transition-shadow"
                    />
                </div>

                {/* Pill Filters */}
                <div className="flex flex-wrap justify-center items-center gap-3 mt-4">
                    {filters.map((filter) => (
                        <button 
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-5 py-2 rounded-full font-inter text-[14px] transition-colors border ${
                                activeFilter === filter 
                                ? 'bg-black text-white border-black font-bold' 
                                : 'bg-transparent text-[#5B5B5B] border-[#E7E5E4] hover:border-black/20'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── DATASETS GRID ────────────────────────────────────────────── */}
            <section className="flex justify-center px-6 md:px-12 pb-32">
                <div className="w-full max-w-[1280px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 flex justify-center">
                            <div className="w-10 h-10 border-4 border-black/10 border-t-[#D1FC00] rounded-full animate-spin"></div>
                        </div>
                    ) : filteredDatasets.length > 0 ? (
                        filteredDatasets.map((d) => (
                            <DatasetCard key={d.id} dataset={d} />
                        ))
                    ) : (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 text-[#A8A29E] font-inter">
                            No datasets found matching your search.
                        </div>
                    )}
                </div>
            </section>

            {/* ── CUSTOM CTA BANNER ────────────────────────────────────────── */}
            <section className="px-6 md:px-12 pb-12 flex justify-center">
                <div className="w-full max-w-[1000px] bg-[#0A0A0A] rounded-[48px] p-[60px] md:p-[80px] flex flex-col items-center text-center">
                    <h2 className="font-manrope font-extrabold text-[40px] md:text-[48px] leading-[1.1] tracking-[-1.5px] text-white mb-6">
                        Need something custom?
                    </h2>
                    <p className="font-inter text-[16px] leading-[28px] text-white/70 max-w-[500px] mb-8">
                        We can engineer a custom scraping pipeline for any source. Get the exact data you need.
                    </p>
                    <Link 
                        href="/request" 
                        className="bg-[#D1FC00] text-[#1C1917] font-inter font-bold text-[16px] px-[32px] py-[16px] rounded-full hover:bg-[#C5ED00] transition-colors"
                    >
                        Request Custom Scraping
                    </Link>
                </div>
            </section>
        </main>
    );
}
