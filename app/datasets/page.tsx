import { Suspense } from "react";
import DatasetCard from "@/components/DatasetCard";
import Filters from "@/components/Filters";
import { MOCK_DATASETS } from "@/lib/mockData";

export default function DatasetsPage() {
    return (
        <main className="min-h-screen bg-slate-50 pt-20 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Datasets</h1>
                    <p className="text-gray-600 text-lg">Browse our collection of premium, structured data.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                            <Suspense fallback={<div>Loading filters...</div>}>
                                <Filters />
                            </Suspense>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            {MOCK_DATASETS.map((d) => (
                                <DatasetCard key={d.id} dataset={d} />
                            ))}
                        </div>

                        {/* Pagination Stub */}
                        <div className="mt-12 flex justify-center">
                            <nav className="flex items-center space-x-2">
                                <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" disabled>Previous</button>
                                <button className="px-4 py-2 border border-blue-500 rounded-md text-sm font-medium text-white bg-blue-600">1</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">2</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Next</button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
