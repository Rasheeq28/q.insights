"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Dataset } from "@/lib/types";
import DataTable from "@/components/DataTable";
import ExportButton from "@/components/ExportButton";

interface DatasetDetailClientProps {
    dataset: Dataset;
}

export default function DatasetDetailClient({ dataset }: DatasetDetailClientProps) {
    const allFields = dataset.fields || [];
    const [selectedFields, setSelectedFields] = useState<string[]>(allFields);

    // State for real data fetching
    const [realData, setRealData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();

    // Determine if we should fetch real data (only for the DSEX dataset)
    const isDsex = dataset.slug === "dsex-prices-historical";

    // Date Range State
    const [minDate, setMinDate] = useState<string>("");
    const [maxDate, setMaxDate] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    useEffect(() => {
        if (!isDsex) return;

        async function fetchMetadata() {
            try {
                const res = await fetch(`/api/datasets?slug=${dataset.slug}&mode=meta`);
                if (res.ok) {
                    const meta = await res.json();
                    if (meta.minDate && meta.maxDate) {
                        setMinDate(meta.minDate);
                        setMaxDate(meta.maxDate);
                        setStartDate(meta.minDate); // Default start
                        setEndDate(meta.maxDate);   // Default end
                    }
                }
            } catch (error) {
                console.error("Failed to fetch metadata", error);
            }
        }
        fetchMetadata();
    }, [isDsex, dataset.slug]);

    useEffect(() => {
        if (!isDsex) return;

        async function fetchData() {
            setLoading(true);
            try {
                const params = new URLSearchParams(searchParams.toString());
                params.set("slug", dataset.slug);
                if (startDate) params.set("startDate", startDate);
                if (endDate) params.set("endDate", endDate);

                const res = await fetch(`/api/datasets?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setRealData(data);
                }
            } catch (error) {
                console.error("Failed to fetch dataset preview", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
        // Debounce or wait for user to stop typing technically better, but for date pickers onBlur/onChange is ok-ish
        // Adding startDate/endDate to dependency array to refresh preview on change
    }, [isDsex, dataset.slug, searchParams, startDate, endDate]);

    const toggleField = (field: string) => {
        if (selectedFields.includes(field)) {
            setSelectedFields(selectedFields.filter((f) => f !== field));
        } else {
            setSelectedFields([...selectedFields, field]);
        }
    };

    // Use real fetched data if applicable, otherwise fallback to static preview
    const previewData = isDsex ? realData : (dataset.previewData || []);

    return (
        <main className="min-h-screen bg-brand-slate-dark pt-24 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <Link href="/datasets" className="text-sm text-brand-emerald hover:text-brand-emerald-hover mb-8 inline-flex items-center gap-2 transition-colors font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Datasets
                </Link>

                <div className="flex flex-col lg:flex-row gap-12 mb-12">
                    {/* Header Section */}
                    <div className="flex-1 order-2 lg:order-1">
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">{dataset.title}</h1>
                        <p className="text-xl text-slate-400 max-w-3xl mb-8 leading-relaxed">
                            {dataset.description}
                        </p>
                        <div className="flex flex-wrap gap-4 items-center">
                            <span className="px-3 py-1 rounded-full border border-brand-emerald text-brand-emerald text-xs font-bold uppercase tracking-wider">Verified</span>
                            <span className="px-3 py-1 rounded-full border border-white/20 text-slate-300 bg-slate-800 text-xs font-bold uppercase tracking-wider">CSV / JSON</span>
                            <span className="px-3 py-1 rounded-full border border-white/20 text-slate-300 bg-slate-800 text-xs font-bold uppercase tracking-wider">1.2 GB</span>
                        </div>
                    </div>

                    <div className="w-full lg:w-[360px] flex-shrink-0 order-1 lg:order-2">
                        {/* Download & API Trigger */}
                        <div className="bg-[#0a0f1a] rounded-xl border border-white/5 overflow-hidden sticky top-28 shadow-xl">
                            <div className="p-5 space-y-4">
                                <ExportButton slug={dataset.slug} fields={selectedFields} startDate={startDate} endDate={endDate} />
                                <Link 
                                    href="/pricing"
                                    className="w-full px-6 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-md bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white flex items-center justify-center gap-2 border border-white/5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    Get API Access
                                </Link>
                            </div>
                            <div className="p-4 flex items-center justify-center gap-3 text-sm text-slate-400 bg-slate-900/50 border-t border-white/5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-emerald opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Source: {dataset.source}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Preview Section */}
                <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                    <div className="p-8 lg:p-10 border-b border-white/5">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                                    Data Preview
                                    {loading && (
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 bg-brand-emerald rounded-full animate-ping"></div>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Updating...</span>
                                        </div>
                                    )}
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Showing a subset of real records</p>
                            </div>

                            <div className="flex items-center gap-2 bg-slate-950/50 px-4 py-2 rounded-full border border-white/5">
                                <span className="h-2 w-2 bg-brand-emerald rounded-full"></span>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Live Sync Enabled</span>
                            </div>
                        </div>

                        {/* Field Selector */}
                        <div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Column Selection</span>
                            <div className="flex flex-wrap gap-2.5">
                                {allFields.map((field) => (
                                    <button
                                        key={field}
                                        onClick={() => toggleField(field)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all active:scale-95 ${selectedFields.includes(field)
                                            ? "bg-brand-emerald/20 text-brand-emerald border-brand-emerald/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                            : "bg-slate-900/50 text-slate-500 border-white/5 hover:border-slate-600 hover:text-slate-300"
                                            }`}
                                    >
                                        {field}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-0 relative min-h-[300px] bg-slate-950/20">
                        {loading && previewData.length === 0 ? (
                            <div className="flex justify-center items-center h-60 text-slate-500 font-bold uppercase tracking-widest text-sm animate-pulse">Initializing Data Stream...</div>
                        ) : (
                            <DataTable data={previewData} fields={selectedFields} />
                        )}
                    </div>

                    <div className="p-6 bg-slate-950/40 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">
                            Showing top {previewData.length} indexed records • Sign in to export full time-series
                        </p>
                    </div>
                </div>

            </div>
        </main>
    );
}
