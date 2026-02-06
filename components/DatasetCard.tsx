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
      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-brand-emerald transition-colors pr-6">
        {dataset.title}
      </h3>

      <p className="text-slate-400 text-sm mb-8 flex-grow line-clamp-3 leading-relaxed">
        {dataset.description}
      </p>

      <div className="pt-6 border-t border-white/5 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {dataset.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[11px] font-bold text-brand-emerald bg-brand-emerald/10 px-3 py-1 rounded-full border border-brand-emerald/20">
                #{tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="px-5 py-2.5 bg-brand-emerald text-slate-950 text-sm font-black rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:bg-brand-emerald-hover group-hover:scale-105 active:scale-95 transition-all">
              View Details
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
