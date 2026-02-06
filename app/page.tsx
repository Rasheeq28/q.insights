import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import DatasetCard from "@/components/DatasetCard";
import { MOCK_DATASETS } from "@/lib/mockData";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Discover & <span className="text-blue-400">Export</span> Premium Datasets
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Access clean, structured data for your next project. From financial markets to e-commerce trends, find exactly what you need in seconds.
          </p>

          <div className="flex justify-center mb-6">
            <SearchBar />
          </div>

          <div className="text-sm text-slate-400">
            Popular: <span className="text-slate-300 underline cursor-pointer">Stock Market</span>, <span className="text-slate-300 underline cursor-pointer">Real Estate</span>, <span className="text-slate-300 underline cursor-pointer">E-commerce</span>
          </div>
        </div>
      </section>

      {/* Featured Datasets Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Featured Datasets</h2>
          <Link href="/datasets" className="text-blue-600 font-medium hover:text-blue-800 flex items-center">
            View all datasets
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_DATASETS.map((dataset) => (
            <DatasetCard key={dataset.id} dataset={dataset} />
          ))}
        </div>
      </section>

      {/* Trust / Stats Section */}
      <section className="bg-slate-50 py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">10M+</div>
              <div className="text-gray-600 font-medium">Data Rows Exported</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600 font-medium">Curated Datasets</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">24h</div>
              <div className="text-gray-600 font-medium">Update Frequency</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
