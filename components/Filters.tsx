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
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Category</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="radio"
              name="category"
              checked={!currentCategory}
              onChange={() => updateFilter("category", null)}
              className="text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className={`text-sm ${!currentCategory ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>All Categories</span>
          </label>
          {CATEGORIES.map((category) => (
            <label key={category} className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={currentCategory === category}
                onChange={() => updateFilter("category", category)}
                className="text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className={`text-sm ${currentCategory === category ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Price</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="radio"
              name="price"
              checked={!currentPrice}
              onChange={() => updateFilter("price", null)}
              className="text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className={`text-sm ${!currentPrice ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>Any Price</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="radio"
              name="price"
              checked={currentPrice === "free"}
              onChange={() => updateFilter("price", "free")}
              className="text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className={`text-sm ${currentPrice === 'free' ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>Free only</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="radio"
              name="price"
              checked={currentPrice === "paid"}
              onChange={() => updateFilter("price", "paid")}
              className="text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className={`text-sm ${currentPrice === 'paid' ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>Paid only</span>
          </label>
        </div>
      </div>
    </div>
  );
}
