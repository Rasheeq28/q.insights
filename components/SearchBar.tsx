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
    <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Search for datasets (e.g., real estate, ecommerce)..."
          className="w-full px-5 py-4 text-lg rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all text-gray-900"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
