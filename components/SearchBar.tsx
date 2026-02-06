"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/datasets?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/datasets");
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl group">
      <div className="relative flex items-center">
        <div className="absolute left-5 text-slate-500 group-focus-within:text-brand-emerald transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search for datasets (e.g., real estate, ecommerce)..."
          className="w-full pl-14 pr-32 py-5 text-lg rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent shadow-2xl transition-all text-white placeholder-slate-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 px-8 bg-brand-emerald text-slate-950 rounded-lg font-bold hover:bg-brand-emerald-hover transition-all shadow-lg active:scale-95"
        >
          Search
        </button>
      </div>
    </form>
  );
}
