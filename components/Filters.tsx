"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = [
  "Finance",
  "Real Estate",
  "E-commerce",
  "Crypto",
  "Entertainment",
  "Weather",
  "Healthcare",
  "Transportation"
];

export default function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const currentPrice = searchParams.get("price");

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/datasets?${params.toString()}`);
  };

  return (
    <div className="space-y-10" suppressHydrationWarning>
      <div suppressHydrationWarning>
        <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase mb-6">Category</h3>
        <div className="space-y-4" suppressHydrationWarning>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="radio"
                name="category"
                checked={!currentCategory}
                onChange={() => updateFilter("category", null)}
                className="peer appearance-none h-5 w-5 rounded-full border-2 border-slate-600 checked:border-brand-emerald transition-all"
              />
              <div className="absolute h-2.5 w-2.5 rounded-full bg-brand-emerald opacity-0 peer-checked:opacity-100 transition-opacity"></div>
            </div>
            <span className={`text-sm transition-colors ${!currentCategory ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-200'}`}>All Categories</span>
          </label>
          {CATEGORIES.map((category) => (
            <label key={category} className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="category"
                  checked={currentCategory === category}
                  onChange={() => updateFilter("category", category)}
                  className="peer appearance-none h-5 w-5 rounded-full border-2 border-slate-600 checked:border-brand-emerald transition-all"
                />
                <div className="absolute h-2.5 w-2.5 rounded-full bg-brand-emerald opacity-0 peer-checked:opacity-100 transition-opacity"></div>
              </div>
              <span className={`text-sm transition-colors ${currentCategory === category ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-200'}`}>{category}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
