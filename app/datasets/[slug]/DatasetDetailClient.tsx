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
        <main className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <Link href="/datasets" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
                    &larr; Back to Datasets
                </Link>

                {/* Header */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{dataset.title}</h1>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">{dataset.source}</span>
                                <span>Updated: {dataset.updatedAt}</span>
                                <span className="font-semibold text-gray-900">{dataset.price === 0 ? "Free" : `$${dataset.price}`}</span>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-col gap-4">
                            {/* Date Range Controls */}
                            {isDsex && (
                                <div className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded-lg border border-gray-200">
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 font-semibold mb-1">From</label>
                                        <input
                                            type="date"
                                            className="border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:border-blue-500"
                                            min={minDate}
                                            max={maxDate}
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <span className="text-gray-400 mt-4">-</span>
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 font-semibold mb-1">To</label>
                                        <input
                                            type="date"
                                            className="border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:border-blue-500"
                                            min={minDate}
                                            max={maxDate}
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                            <ExportButton slug={dataset.slug} fields={selectedFields} startDate={startDate} endDate={endDate} />
                        </div>
                    </div>

                    <p className="text-gray-700 text-lg leading-relaxed max-w-3xl">
                        {dataset.description}
                    </p>
                </div>

                {/* Data Preview Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Data Preview
                            {loading && <span className="ml-2 text-sm font-normal text-gray-500">(Refreshing...)</span>}
                        </h2>

                        {/* Field Selector */}
                        <div className="mb-6">
                            <span className="text-sm font-semibold text-gray-700 block mb-2">Select Columns:</span>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                {allFields.map((field) => (
                                    <button
                                        key={field}
                                        onClick={() => toggleField(field)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedFields.includes(field)
                                            ? "bg-blue-100 text-blue-700 border-blue-200"
                                            : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                                            }`}
                                    >
                                        {field}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-0 relative min-h-[200px]">
                        {loading && previewData.length === 0 ? (
                            <div className="flex justify-center items-center h-40 text-gray-500">Loading data...</div>
                        ) : (
                            <DataTable data={previewData} fields={selectedFields} />
                        )}
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500">
                        Showing top {previewData.length} records • Sign in to export full dataset
                    </div>
                </div>

            </div>
        </main>
    );
}
