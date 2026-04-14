"use client";

import Link from "next/link";
import { useState } from "react";

export type InsightCardType = "stat" | "table" | "chart";

export interface InsightCardData {
  slug: string;
  title: string;
  description: string;
  type: InsightCardType;
  dataset_slug: string;
  dataset_title: string;
  tag?: string;
  data?: Record<string, unknown>[] | Record<string, unknown> | null;
  isLoading?: boolean;
  lastUpdated?: string;
}

function fmt(val: unknown): string {
  if (val === null || val === undefined) return "—";
  const n = Number(val);
  if (!isNaN(n)) {
    if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (Math.abs(n) >= 1_000) return n.toLocaleString();
    return n.toFixed(2);
  }
  return String(val);
}

function friendlyKey(k: string) {
  return k.replace(/_/g, " ").replace(/\bpct\b/g, "%").replace(/\bmn\b/g, "(M)");
}

function isChangePct(key: string) {
  return key.includes("change") || key.includes("pct") || key.includes("_p");
}

// ─── Minimalist Stat List ───────────────────────────────────────────────────

function StatList({ data }: { data: Record<string, unknown> | null | undefined }) {
  if (!data) return <div className="text-[#A8A29E] text-xs py-4">No data</div>;

  const entries = Object.entries(data).filter(
    ([k]) => !["last_updated", "date", "title"].includes(k)
  );

  return (
    <div className="flex flex-col gap-3 py-2">
      {entries.map(([key, value]) => {
        const numVal = Number(value);
        const isChange = isChangePct(key);
        const isPos = isChange && numVal > 0;
        const isNeg = isChange && numVal < 0;

        return (
          <div key={key} className="flex items-center justify-between border-b border-[#F0F0F0] pb-2 last:border-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29E]">
              {friendlyKey(key)}
            </span>
            <span className={`font-manrope font-black text-[16px] ${isPos ? "text-[#4C5D00]" : isNeg ? "text-red-500" : "text-[#1C1917]"}`}>
              {isChange ? `${isPos ? "+" : ""}${numVal.toFixed(2)}%` : fmt(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Simple Table ─────────────────────────────────────────────────────────────

function SimpleTable({ data }: { data: Record<string, unknown>[] | null | undefined }) {
  if (!data || data.length === 0) return <div className="text-[#A8A29E] text-xs py-4">No data</div>;

  const columns = Object.keys(data[0]).filter((k) => !["date", "id", "sector"].includes(k)).slice(0, 3);

  return (
    <div className="w-full">
      <div className="flex border-b border-[#E7E5E4] pb-2 mb-2">
        {columns.map(col => (
          <div key={col} className="flex-1 text-[9px] font-black uppercase tracking-wider text-[#A8A29E]">
            {friendlyKey(col)}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2.5">
        {data.slice(0, 5).map((row, i) => (
          <div key={i} className="flex items-center text-[12px]">
            {columns.map(col => {
                const val = row[col];
                const isChange = isChangePct(col);
                const numVal = Number(val);
                return (
                  <div key={col} className={`flex-1 font-bold ${isChange ? (numVal > 0 ? "text-[#4C5D00]" : "text-red-500") : "text-[#1C1917]"}`}>
                    {isChange ? `${numVal > 0 ? "+" : ""}${numVal.toFixed(2)}%` : fmt(val)}
                  </div>
                );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Card (Modern & Clean) ───────────────────────────────────────────────

export function InsightCard({ card }: { card: InsightCardData }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/api/insights?slug=${card.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col bg-white border border-[#E7E5E4] rounded-[32px] p-7 transition-all hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-[#D1FC00] h-full">
      
      {/* Header Info */}
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center justify-between mb-2">
            <span className="bg-[#D1FC00] text-[#4C5D00] text-[9px] font-black uppercase tracking-[1.5px] px-2.5 py-1 rounded-full">
                {card.tag || 'Data'}
            </span>
            <div className="flex items-center gap-1.5 grayscale opacity-50">
                <span className="w-1.5 h-1.5 bg-[#4C5D00] rounded-full animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Live</span>
            </div>
        </div>
        <h3 className="font-manrope font-black text-[20px] tracking-tight text-[#1C1917]">
          {card.title}
        </h3>
        <p className="font-inter text-[12px] leading-relaxed text-[#5B5B5B]">
          {card.description}
        </p>
      </div>

      {/* Primary Data Area */}
      <div className="flex-1 py-4">
        {card.type === "stat" ? <StatList data={card.data as any} /> : <SimpleTable data={card.data as any} />}
      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-[#F0F0F0] flex items-center justify-between">
        <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Updated</span>
            <span className="text-[12px] font-bold text-[#1C1917]">Just now</span>
        </div>
        
        <Link
            href={`/datasets/${card.dataset_slug}`}
            className="h-11 px-6 rounded-full bg-[#1C1917] text-[#D1FC00] text-[13px] font-bold flex items-center gap-2 hover:bg-[#4C5D00] transition-all"
        >
            Use this data →
        </Link>
      </div>
    </div>
  );
}

export function InsightCardSkeleton() {
    return (
      <div className="bg-white border border-[#E7E5E4] rounded-[32px] p-7 h-[400px] animate-pulse flex flex-col gap-6">
        <div className="h-6 w-20 bg-[#F6F6F6] rounded-full" />
        <div className="space-y-3">
            <div className="h-6 w-3/4 bg-[#F6F6F6] rounded-md" />
            <div className="h-4 w-full bg-[#F6F6F6] rounded-md" />
        </div>
        <div className="flex-1 bg-[#F6F6F6]/50 rounded-2xl" />
      </div>
    );
}
