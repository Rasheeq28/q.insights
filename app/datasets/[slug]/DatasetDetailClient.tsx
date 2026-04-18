"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Dataset } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface DatasetDetailClientProps {
    dataset: Dataset;
}

export default function DatasetDetailClient({ dataset }: DatasetDetailClientProps) {
    const allFields = (dataset.fields || []).filter((f: string) => f.toLowerCase() !== 'id');
    const [selectedFields, setSelectedFields] = useState<string[]>(allFields);
    const [filteredPreviewData, setFilteredPreviewData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    const [hasClickedUseData, setHasClickedUseData] = useState(false);
    const [selectedTool, setSelectedTool] = useState("google_sheets");
    
    // Panel Auth States
    const [user, setUser] = useState<any>(null);
    const [tokenString, setTokenString] = useState("");
    const [processing, setProcessing] = useState(false);
    const [limitReached, setLimitReached] = useState(false);
    
    const router = useRouter();

    useEffect(() => {
        // Initial fetch of the default un-filtered table (for everyone)
        fetchRealData(allFields);
        
        // Check Auth Status for the Use Data panel
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setUser(session.user);
        });
    }, []);

    // Fetch data whenever fields are requested
    const fetchRealData = async (fieldsToFetch: string[]) => {
        if (fieldsToFetch.length === 0) {
            setFilteredPreviewData([]);
            return;
        }
        
        setLoading(true);
        try {
            const selectString = fieldsToFetch.join(',');
            const tableName = (dataset as any).table_name || dataset.slug.replace(/-/g, "_");
            
            const { data, error } = await supabase
                .from(tableName as string)
                .select(selectString)
                .limit(5);

            if (data && data.length > 0) {
                setFilteredPreviewData(data);
            } else if (dataset.previewData) {
                const mappedFallback = dataset.previewData.map((row: any) => {
                    const newRow: any = {};
                    fieldsToFetch.forEach(f => newRow[f] = row[f]);
                    return newRow;
                });
                setFilteredPreviewData(mappedFallback);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const toggleColumn = (field: string) => {
        const newFields = selectedFields.includes(field) 
            ? selectedFields.filter(f => f !== field)
            : [...selectedFields, field];
            
        setSelectedFields(newFields);
        fetchRealData(newFields);
    };

    const handleGetApi = async () => {
        if (!user) {
            router.push(`/signup?next=/datasets/${dataset.slug}`);
            return;
        }

        setProcessing(true);
        setLimitReached(false);

        // Check 2 API limits natively
        const { data: existingTokens } = await supabase
            .from("api_tokens")
            .select("id")
            .eq("user_id", user.id)
            .eq("status", "active");

        if (existingTokens && existingTokens.length >= 2) {
            setLimitReached(true);
            setProcessing(false);
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session");

            const response = await fetch("/api/generate-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    dataset_slug: dataset.slug,
                    filters: { columns: selectedFields }
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                alert(`API Error: ${errText}`);
                throw new Error(errText);
            }
            
            const result = await response.json();
            setTokenString(result.token);
        } catch (error: any) {
            console.error("Token generation fail:", error);
            alert(`Token generation failed: ${error.message || error}`);
        }
        
        setProcessing(false);
    };

    return (
        <main className="min-h-screen pt-[100px] md:pt-[130px] font-inter bg-[#F6F6F6] pb-24">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col gap-8 md:gap-[48px]">
                {/* Header Section */}
                <div className="flex flex-col gap-6">
                    <Link href="/datasets" className="text-sm text-[#A8A29E] hover:text-[#2F2F2F] mb-2 inline-flex items-center gap-2 font-inter font-bold uppercase tracking-[1.2px] w-fit">
                        <span className="text-xl">&larr;</span> Back to Datasets
                    </Link>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                        <div className="flex flex-col gap-4 max-w-3xl">
                            <h1 className="font-manrope font-normal text-[32px] sm:text-[48px] lg:text-[60px] leading-[1.1] text-[#2F2F2F] tracking-[-1.5px] md:tracking-[-2.4px]">
                                Track {dataset.title} live
                            </h1>
                            <p className="font-inter font-normal text-[16px] md:text-[18px] leading-[22px] md:leading-[28px] text-[#5B5B5B]">
                                Use this data in Sheets, Excel, or your own project.
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            {!hasClickedUseData && (
                                <button 
                                    onClick={() => setHasClickedUseData(true)}
                                    className="flex items-center justify-center px-[32px] py-[16px] bg-[#D1FC00] text-[#1C1917] font-inter font-bold text-[16px] rounded-full hover:bg-[#C5ED00] transition-colors shadow-sm whitespace-nowrap"
                                >
                                    Use Data
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {hasClickedUseData && (
                    <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 border-2 border-[#D1FC00] shadow-[0_8px_32px_-12px_rgba(209,252,0,0.3)] flex flex-col gap-8 transition-all animate-in slide-in-from-top-4">
                        <h2 className="font-manrope font-bold text-[24px] md:text-[28px] text-[#1C1917] tracking-tight">Configure Your Connection</h2>
                        
                        {tokenString ? (
                            <div className="bg-[#1C1917] rounded-[32px] p-6 lg:p-12 border-2 border-[#D1FC00] shadow-[0_8px_32px_-12px_rgba(209,252,0,0.3)] flex flex-col gap-8 animate-in zoom-in-95 duration-500">
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D1FC00]/10 rounded-full w-fit">
                                            <span className="w-2 h-2 rounded-full bg-[#D1FC00] animate-pulse"></span>
                                            <span className="font-inter font-bold text-[10px] text-[#D1FC00] uppercase tracking-[1px]">Connection Live</span>
                                        </div>
                                        <h3 className="font-manrope font-bold text-[24px] md:text-[32px] text-white tracking-tight">Your Dataset Formula</h3>
                                        <p className="font-inter text-[14px] md:text-[15px] text-[#A8A29E]">Copy this into cell <strong>A1</strong> of Google Sheets or Excel.</p>
                                    </div>
                                    
                                    <button 
                                        onClick={() => {
                                            const formula = `=IMPORTDATA("${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/datasets/${dataset.slug}?token=${tokenString}&fields=${selectedFields.join(",")}&format=csv")`;
                                            navigator.clipboard.writeText(formula);
                                        }}
                                        className="bg-[#D1FC00] hover:bg-white text-black font-inter font-bold text-[16px] px-10 py-4 rounded-full transition-all shadow-lg hover:shadow-[#D1FC00]/20 flex items-center gap-3 active:scale-95 group shrink-0"
                                    >
                                        <span>Copy Formula</span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    </button>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 relative group cursor-pointer hover:border-[#D1FC00]/30 transition-colors">
                                    <code className="block font-mono text-[16px] lg:text-[18px] text-[#D1FC00] leading-relaxed break-all select-all">
                                        =IMPORTDATA("{process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/api/datasets/{dataset.slug}?token={tokenString}&fields={selectedFields.join(",")}&format=csv")
                                    </code>
                                    <div className="absolute top-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest">Click to select all</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-white/10 mt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[18px]">📊</div>
                                        <p className="text-[13px] text-[#A8A29E]">Works in <strong>Google Sheets</strong></p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[18px]">📗</div>
                                        <p className="text-[13px] text-[#A8A29E]">Works in <strong>Microsoft Excel</strong></p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col lg:flex-row gap-12">
                                <div className="flex-1 flex flex-col gap-6">
                                    {/* 1. Filter Columns */}
                                    <div>
                                        <h3 className="font-inter font-bold text-[14px] uppercase tracking-[1.5px] text-[#1C1917] mb-4 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-[#F6F6F6] text-[12px] flex items-center justify-center">1</span>
                                            Filter Columns
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {allFields.map(f => (
                                                <button
                                                    key={f}
                                                    onClick={() => toggleColumn(f)}
                                                    className={`px-4 py-2 rounded-full font-inter text-[13px] font-bold transition-colors border ${
                                                        selectedFields.includes(f) 
                                                        ? 'bg-black text-white border-black' 
                                                        : 'bg-transparent text-[#5B5B5B] border-[#E7E5E4] hover:border-black/30'
                                                    }`}
                                                >
                                                    {f.replace(/_/g, ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
    
                                    {/* 2. Choose Tool */}
                                    <div className="pt-4 border-t border-[#F0F0F0]">
                                        <h3 className="font-inter font-bold text-[14px] uppercase tracking-[1.5px] text-[#1C1917] mb-4 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-[#F6F6F6] text-[12px] flex items-center justify-center">2</span>
                                            Choose Tool
                                        </h3>
                                        <div className="flex flex-wrap gap-4">
                                            <button 
                                                onClick={() => setSelectedTool("google_sheets")}
                                                className={`px-6 py-4 rounded-xl border flex items-center gap-3 transition-colors ${selectedTool === 'google_sheets' ? 'border-black bg-[#FAFAFA]' : 'border-[#E7E5E4] hover:bg-white'}`}
                                            >
                                                <span className="text-xl">📊</span>
                                                <span className="font-inter font-bold text-[15px] text-[#1C1917]">Google Sheets</span>
                                            </button>
                                            <button 
                                                onClick={() => setSelectedTool("excel")}
                                                className={`px-6 py-4 rounded-xl border flex items-center gap-3 transition-colors ${selectedTool === 'excel' ? 'border-black bg-[#FAFAFA]' : 'border-[#E7E5E4] hover:bg-white'}`}
                                            >
                                                <span className="text-xl">📗</span>
                                                <span className="font-inter font-bold text-[15px] text-[#1C1917]">Microsoft Excel</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
    
                                {/* Right Side Actions */}
                                <div className="lg:w-[320px] shrink-0 bg-[#F6F6F6] p-8 rounded-[32px] flex flex-col justify-center">
                                    <h3 className="font-manrope font-bold text-[24px] text-[#1C1917] mb-2">{user ? "Generate URL" : "Create Account"}</h3>
                                    
                                    {limitReached ? (
                                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
                                            <p className="font-inter font-bold text-[13px] mb-1">Limit Reached</p>
                                            <p className="font-inter text-[12px]">You have already generated 2 free connections. Email me at <span className="select-all font-mono font-bold mx-1 px-1 py-0.5 bg-red-100 rounded text-red-900">rasheeqferdous28@gmail.com</span> for more dataset connections.</p>
                                        </div>
                                    ) : (
                                        <p className="font-inter text-[14px] text-[#5B5B5B] mb-8">
                                            {user 
                                                ? "Get your private URL instantly locked into these specific columns." 
                                                : "You'll need a free Q.Labs account to secure your live connection."}
                                        </p>
                                    )}
                                    
                                    <button 
                                        onClick={handleGetApi}
                                        disabled={processing || limitReached}
                                        className="w-full bg-black hover:bg-black/80 text-white font-inter font-bold text-[16px] py-[16px] rounded-full transition-all flex justify-center items-center gap-2 disabled:bg-black/50"
                                    >
                                        {processing ? "Processing..." : limitReached ? "Upgrade Required" : user ? "Get URL" : "Sign up to use data"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Content Area */}
                <div className="bg-[#FFFFFF] rounded-[32px] md:rounded-[48px] p-6 md:p-[40px] shadow-[0px_25px_50px_-12px_rgba(47,47,47,0.05)] border border-[#1C1917]/5 flex flex-col gap-8 md:gap-[40px]">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h3 className="font-manrope font-bold text-[24px] text-[#2F2F2F] tracking-[-0.6px]">Live Data Preview</h3>
                        </div>
                        
                        <div className="flex flex-col gap-6 w-full">
                            <div className="relative border border-[#E7E5E4] rounded-2xl overflow-hidden bg-white">
                                {loading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 backdrop-blur-[2px]">
                                        <div className="w-10 h-10 border-4 border-[#E2E2E2] border-t-[#D1FC00] rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <div className="overflow-x-auto w-full">
                                    <table className="w-full text-left font-inter border-collapse min-w-[600px]">
                                        <thead>
                                            <tr className="text-[#A8A29E] text-[11px] uppercase tracking-[1.5px] border-b border-[#F0F0F0] bg-[#FAFAFA]">
                                                {selectedFields.map((header) => (
                                                    <th key={header} className="py-4 font-bold px-4 first:pl-6 last:pr-6 whitespace-nowrap">
                                                        {header.replace(/_/g, ' ')}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPreviewData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={selectedFields.length || 1} className="text-center py-10 text-[#A8A29E]">No data or columns available.</td>
                                                </tr>
                                            ) : (
                                                filteredPreviewData.map((row, i) => (
                                                    <tr key={i} className="border-b border-[#F0F0F0]/50 hover:bg-[#FAFAFA] transition-colors last:border-0">
                                                        {selectedFields.map(field => (
                                                            <td key={field} className="py-4 px-4 text-[14px] text-[#1C1917] first:pl-6 last:pr-6 truncate max-w-[200px]">
                                                                {row[field] !== null && row[field] !== undefined ? String(row[field]) : '-'}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
