"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Dataset } from "@/lib/types";
import DataTable from "@/components/DataTable";
import ExportButton from "@/components/ExportButton";
import { supabase } from "@/lib/supabase";

interface DatasetDetailClientProps {
    dataset: Dataset;
}

// ─── API Access Modal ────────────────────────────────────────────────────────
import MultiSelect from "@/components/MultiSelect";

function ApiAccessPanel({ slug }: { slug: string }) {
    const isSupported = slug === "dsex-prices-historical";

    // --- State: Wizard ---
    const [step, setStep] = useState(1); // 1: Filters, 2: Platform, 3: Result
    const [platform, setPlatform] = useState<"sheets" | "excel" | "postman" | "browser">("sheets");

    // --- State: Data for Dropdowns ---
    const [availableSectors, setAvailableSectors] = useState<string[]>([]);
    const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
    const [allCompanies, setAllCompanies] = useState<string[]>([]);
    const [mappings, setMappings] = useState<{ code: string; sector: string }[]>([]);

    // --- State: Filters ---
    const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
    const [start, setStart] = useState("2024-01-01");
    const [end, setEnd] = useState("2024-12-31");

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ api_url: string; json_api_url?: string; supabase_api_url?: string; expires_at: string } | null>(null);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    // Fetch filters on mount
    useEffect(() => {
        if (!isSupported) return;
        async function fetchFilters() {
            try {
                const res = await fetch("/api/filters");
                if (res.ok) {
                    const data = await res.json();
                    setAvailableSectors(data.sectors || []);
                    setAllCompanies(data.tradingCodes || []);
                    setAvailableCompanies(data.tradingCodes || []);
                    setMappings(data.mappings || []);
                }
            } catch (err) {
                console.error("Failed to fetch filters", err);
            }
        }
        fetchFilters();
    }, [isSupported]);

    useEffect(() => {
        if (selectedSectors.length === 0) {
            setAvailableCompanies(allCompanies);
            return;
        }
        const filtered = mappings
            .filter(m => selectedSectors.includes(m.sector))
            .map(m => m.code);
        
        setAvailableCompanies(filtered);
        
        // Prune selected companies that are no longer in the filtered list
        setSelectedCompanies(prev => prev.filter(c => filtered.includes(c)));
    }, [selectedSectors, allCompanies, mappings]);

    async function generateToken() {
        setLoading(true);
        setError("");
        try {
            const { data: authData, error: authError } = await supabase.auth.getSession();
            if (authError || !authData.session) {
                throw new Error("You must be signed in to generate an API link.");
            }

            const body = {
                dataset_slug: slug,
                filters: {
                    companies: selectedCompanies,
                    sectors: selectedSectors,
                    start,
                    end,
                    platform, // Inject the selected platform
                }
            };
            const res = await fetch("/api/generate-token", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authData.session.access_token}`
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed to generate token");
            setResult(data);
            setStep(3); // Move to final result step
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    function applyDatePreset(months: number) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - months);
        setEnd(endDate.toISOString().split("T")[0]);
        setStart(startDate.toISOString().split("T")[0]);
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    const platformInfo = {
        sheets: { label: "Google Sheets", icon: "🟢", desc: "For live data in spreadsheets", template: (url: string) => `=IMPORTDATA("${url}")` },
        excel: { label: "Excel", icon: "🟩", desc: "For Power Query analysis", template: (url: string) => url },
        postman: { label: "Postman", icon: "🟠", desc: "For developers / API testing", template: (url: string) => url },
        browser: { label: "Browser", icon: "🌐", desc: "For direct CSV download", template: (url: string) => url },
    };

    if (!isSupported) return null;

    return (
        <div className="mt-4 rounded-xl border border-brand-emerald/20 bg-[#050c14] overflow-hidden transition-all duration-300 shadow-2xl">
            {/* Header / Stepper */}
            <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded bg-brand-emerald/10 flex items-center justify-center text-[10px] font-bold text-brand-emerald">
                        {step}
                    </div>
                    <div>
                        <p className="text-white text-[11px] font-bold uppercase tracking-tight">
                            {step === 1 && "Selection: What data do you need?"}
                            {step === 2 && "Platform: Where will you use it?"}
                            {step === 3 && "Complete: Your API is ready!"}
                        </p>
                    </div>
                </div>
                {step > 1 && (
                    <button 
                        onClick={() => setStep(step - 1)}
                        className="text-[10px] text-slate-500 hover:text-white font-bold uppercase transition-colors"
                    >
                        ← Back
                    </button>
                )}
            </div>

            <div className="p-5">
                {/* STEP 1: FILTERS */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <MultiSelect
                            label="Filter by Sectors"
                            options={availableSectors}
                            selected={selectedSectors}
                            onChange={setSelectedSectors}
                            placeholder="All Sectors"
                        />
                        <MultiSelect
                            label="Select Specific Companies"
                            options={availableCompanies}
                            selected={selectedCompanies}
                            onChange={setSelectedCompanies}
                            placeholder="All Companies"
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Start Date</label>
                                <input
                                    type="date"
                                    value={start}
                                    onChange={(e) => setStart(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-brand-emerald/50 outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">End Date</label>
                                <input
                                    type="date"
                                    value={end}
                                    onChange={(e) => setEnd(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-brand-emerald/50 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                            {[{ l: "1m", v: 1 }, { l: "3m", v: 3 }, { l: "6m", v: 6 }, { l: "12m", v: 12 }].map(p => (
                                <button
                                    key={p.l}
                                    onClick={() => applyDatePreset(p.v)}
                                    className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[9px] font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-all uppercase"
                                >
                                    Last {p.l}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-3 rounded-lg bg-brand-emerald text-slate-900 font-bold text-xs uppercase tracking-wider hover:bg-brand-emerald-hover transition-all mt-4 flex items-center justify-center gap-2"
                        >
                            Next: Choose Platform
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* STEP 2: PLATFORM */}
                {step === 2 && (
                    <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                        {Object.entries(platformInfo).map(([key, info]) => (
                            <button
                                key={key}
                                onClick={() => {
                                    setPlatform(key as any);
                                    generateToken();
                                }}
                                disabled={loading}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-brand-emerald/40 hover:bg-brand-emerald/5 transition-all text-left group"
                            >
                                <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                    {info.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white group-hover:text-brand-emerald transition-colors">{info.label}</p>
                                    <p className="text-[10px] text-slate-500">{info.desc}</p>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700 group-hover:text-brand-emerald transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}
                        {loading && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="h-8 w-8 border-3 border-brand-emerald/30 border-t-brand-emerald rounded-full animate-spin" />
                                    <p className="text-[10px] font-bold text-brand-emerald uppercase tracking-widest">Generating Link...</p>
                                </div>
                            </div>
                        )}
                        {error && <p className="text-red-400 text-[10px] font-bold mt-2">{error}</p>}
                    </div>
                )}

                {/* STEP 3: RESULT */}
                {step === 3 && result && (
                    <div className="space-y-4 animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center p-4 rounded-xl bg-brand-emerald/5 border border-brand-emerald/10 mb-4">
                            <div className="h-12 w-12 rounded-full bg-brand-emerald/20 text-brand-emerald flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-tight">API Link Connected</h4>
                            <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                                Your custom data feed for **{platformInfo[platform].label}** is ready.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <div className="absolute -top-2 left-3 px-1.5 bg-[#050c14] text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                    {platform === "sheets" || platform === "excel" ? "Cloud URL (Production)" : "API URL"}
                                </div>
                                <pre className="text-[10px] text-brand-emerald bg-slate-950 rounded-lg px-4 py-4 overflow-x-auto whitespace-pre-wrap break-all border border-brand-emerald/20 leading-relaxed font-mono">
                                    {platformInfo[platform].template(platform === "postman" ? (result.json_api_url || result.api_url) : result.api_url)}
                                </pre>
                                <button
                                    onClick={() => copyToClipboard(platformInfo[platform].template(platform === "postman" ? (result.json_api_url || result.api_url) : result.api_url))}
                                    className={`absolute top-3 right-3 p-2 rounded-md transition-all ${copied ? "bg-brand-emerald text-slate-900 scale-110" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}
                                >
                                    {copied ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <div className="p-3.5 rounded-lg bg-slate-900 border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">How to use:</p>
                                <p className="text-[10px] text-slate-300 leading-relaxed">
                                    {platform === "sheets" && "1. Open Google Sheets. 2. Select a cell. 3. Paste the formula above. 4. Wait for data to load."}
                                    {platform === "excel" && "1. Copy URL. 2. Go to Data → From Web. 3. Paste URL. 4. Click Load."}
                                    {platform === "postman" && "1. Create a new GET request. 2. Paste URL. 3. Click Send."}
                                    {platform === "browser" && "1. Paste URL in address bar. 2. Press Enter. 3. Your CSV will download immediately."}
                                </p>
                            </div>

                            <div className="flex justify-center pt-2">
                                <button 
                                    onClick={() => setStep(1)}
                                    className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest border-b border-transparent hover:border-white transition-all pb-0.5"
                                >
                                    Create New Token
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
// ─── END ApiAccessPanel ──────────────────────────────────────────────────────

export default function DatasetDetailClient({ dataset }: DatasetDetailClientProps) {
    const allFields = dataset.fields || [];
    const [selectedFields, setSelectedFields] = useState<string[]>(allFields);
    const [showApiPanel, setShowApiPanel] = useState(false);

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
                        setStartDate(meta.minDate);
                        setEndDate(meta.maxDate);
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
    }, [isDsex, dataset.slug, searchParams, startDate, endDate]);

    const toggleField = (field: string) => {
        if (selectedFields.includes(field)) {
            setSelectedFields(selectedFields.filter((f) => f !== field));
        } else {
            setSelectedFields([...selectedFields, field]);
        }
    };

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
                            <div className="p-5 space-y-3">
                                <ExportButton slug={dataset.slug} fields={selectedFields} startDate={startDate} endDate={endDate} />

                                {/* Get API Access — toggles inline panel */}
                                <button
                                    onClick={() => setShowApiPanel((v) => !v)}
                                    className={`w-full px-6 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-2 border ${showApiPanel
                                        ? "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/30"
                                        : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border-white/5"
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${showApiPanel ? "text-brand-emerald" : "text-brand-emerald"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    {showApiPanel ? "Hide API Panel" : "Get API Access"}
                                </button>

                                {/* Inline API Panel */}
                                {showApiPanel && <ApiAccessPanel slug={dataset.slug} />}
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
