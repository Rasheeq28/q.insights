import Link from "next/link";
import { Dataset } from "@/lib/types";

interface DatasetCardProps {
  dataset: Dataset;
}

export default function DatasetCard({ dataset }: DatasetCardProps) {
  return (
    <Link
      href={`/datasets/${dataset.slug}`}
      className="group block p-6 border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all bg-white h-full flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {dataset.title}
        </h3>
        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">
          {dataset.source}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">
        {dataset.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
        <div className="flex flex-wrap gap-2">
          {dataset.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {dataset.price === 0 ? "Free" : `$${dataset.price}`}
        </span>
      </div>
    </Link>
  );
}
