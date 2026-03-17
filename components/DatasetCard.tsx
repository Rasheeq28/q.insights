import Link from "next/link";
import { Dataset } from "@/lib/types";

interface DatasetCardProps {
  dataset: Dataset;
}

export default function DatasetCard({ dataset }: DatasetCardProps) {
  return (
    <Link
      href={`/datasets/${dataset.slug}`}
      className="group block p-8 border border-white/5 rounded-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.05)] hover:border-brand-emerald/20 transition-all bg-slate-800/40 backdrop-blur-sm h-full flex flex-col relative overflow-hidden"
    >
      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-emerald transition-colors pr-6">
        {dataset.title}
      </h3>
      <div className="text-xs text-slate-500 mb-4 pb-4 border-b border-white/5">
        Source: {dataset.source}
      </div>

      <p className="text-slate-400 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
        {dataset.description}
      </p>

      <div className="mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-brand-emerald shadow-[0_0_8px_rgba(204,255,0,0.6)]"></div>
            <span className="text-xs text-slate-400 font-medium">{dataset.price === 0 ? 'Free' : 'Premium'} Dataset</span>
          </div>
          <div className="px-4 py-2 bg-brand-emerald text-slate-950 text-xs font-black rounded-lg shadow-[0_0_20px_rgba(204,255,0,0.2)] group-hover:bg-brand-emerald-hover group-hover:scale-105 active:scale-95 transition-all">
            View Dataset
          </div>
        </div>
      </div>
    </Link>
  );
}
