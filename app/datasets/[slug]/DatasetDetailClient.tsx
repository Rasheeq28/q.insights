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

                {/* Header Card */}
                <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-white/5 mb-10 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10 relative z-10">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">{dataset.title}</h1>
                            <div className="flex flex-wrap gap-4 items-center">
                                <span className="text-slate-400 text-sm font-medium">Updated: {dataset.updatedAt}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 w-full md:w-auto">
                            {/* Date Range Controls */}
                            {isDsex && (
                                <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-inner">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date Range</div>
                                        <div className="flex gap-1.5">
                                            {[
                                                { label: '7D', days: 7 },
                                                { label: '30D', days: 30 },
                                                { label: '1Y', days: 365 },
                                                { label: 'MAX', days: null }
                                            ].map((range) => (
                                                <button
                                                    key={range.label}
                                                    onClick={() => {
                                                        const end = new Date(maxDate);
                                                        setEndDate(maxDate);
                                                        if (range.days) {
                                                            const start = new Date(end);
                                                            start.setDate(start.getDate() - range.days);
                                                            setStartDate(start.toISOString().split('T')[0]);
                                                        } else {
                                                            setStartDate(minDate);
                                                        }
                                                    }}
                                                    className="px-2 py-1 bg-slate-800 hover:bg-brand-emerald/20 text-slate-400 hover:text-brand-emerald rounded text-[10px] font-bold border border-white/5 transition-all"
                                                >
                                                    {range.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col gap-1.5 relative">
                                            <input
                                                type="date"
                                                className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald/50 transition-all font-medium color-scheme-dark"
                                                min={minDate}
                                                max={maxDate}
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            />
                                        </div>
                                        <span className="text-slate-700">-</span>
                                        <div className="flex flex-col gap-1.5 relative">
                                            <input
                                                type="date"
                                                className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald/50 transition-all font-medium color-scheme-dark"
                                                min={minDate}
                                                max={maxDate}
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <style jsx>{`
                                        .color-scheme-dark {
                                            color-scheme: dark;
                                        }
                                    `}</style>
                                </div>
                            )}
                            <ExportButton slug={dataset.slug} fields={selectedFields} startDate={startDate} endDate={endDate} />
                        </div>
                    </div>

                    <p className="text-slate-300 text-lg leading-relaxed max-w-4xl font-medium opacity-90 relative z-10">
                        {dataset.description}
                    </p>
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
