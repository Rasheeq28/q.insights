import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { fetchInsightData, InsightCardConfig } from '@/lib/insights';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Q.Labs | Track Live Data Instantly',
  description: 'Stop Copying Data. Get it live in Sheets instantly. Choose from thousands of pre-built datasets or request a custom build.',
};

const FEATURE_CARDS = [
  {
    icon: '📈',
    title: 'Stock Markets',
    desc: 'Real-time ticker data synced directly to your financial models.',
    color: '#D1FC00'
  },
  {
    icon: '🛒',
    title: 'E-commerce',
    desc: 'Monitor price changes and inventory across any platform automatically.',
    color: '#D1FC00'
  },
  {
    icon: '🔍',
    title: 'Search Trends',
    desc: 'Capture keyword and consumer behavior data as it happens.',
    color: '#D1FC00'
  },
  {
    icon: '🏢',
    title: 'Real Estate',
    desc: 'Track property listings, aggregate pricing data, and analyze market trends.',
    color: '#D1FC00'
  }
];

export default async function Home() {
  // Fetch active insight cards to show real, live data summaries
  const { data: cards } = await supabase
    .from('insight_cards')
    .select('*, dataset:datasets!inner(title, tags)')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(3);

  const liveInsights: any[] = [];
  
  if (cards) {
      for (const card of cards) {
          const data = await fetchInsightData({
              slug: card.slug,
              type: card.type,
              config: card.config as InsightCardConfig
          });

          if (data) {
              const datasetMeta = card.dataset as any;
              const tags = (datasetMeta?.tags as string[]) ?? [];
              
              // Handle both array (table) and object (stat) data types
              const rows = Array.isArray(data) ? data.slice(0, 3) : [data];
              
              const keys = Object.keys(rows[0] || {}).filter(k => k.toLowerCase() !== 'id' && k.toLowerCase() !== 'date');
              const key1 = keys[0] || 'Unknown';
              const key2 = keys[1] || keys[0] || 'Value';

              const mappedData = rows.map(r => ({
                  label: (r as any)[key1] ? String((r as any)[key1]).substring(0, 20) : 'Data',
                  val: (r as any)[key2] || '-'
              }));

              liveInsights.push({
                  title: card.title,
                  category: tags[0]?.toUpperCase() || 'INSIGHT',
                  data: mappedData,
                  updated: 'Live Data',
                  slug: card.dataset_slug
              });
          }
      }
  }

  // Fallback if no cards exist
  if (liveInsights.length === 0) {
      liveInsights.push({
          title: "Waiting for Insights",
          category: "SYSTEM",
          data: [{ label: "Status", val: "Connecting..." }],
          updated: "Just now",
          slug: "datasets"
      });
  }

  return (
    <main className="min-h-screen pt-[80px] font-inter bg-[#FAFAFA] text-[#1C1917]">
      
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center text-center px-6 md:px-12 pt-[60px] md:pt-[120px] pb-[40px] md:pb-[80px] w-full max-w-[1000px] mx-auto">
        <h1 className="font-manrope font-extrabold text-[42px] sm:text-[56px] md:text-[76px] leading-[1.05] tracking-[-1.5px] md:tracking-[-2.5px] text-[#1C1917] mb-6">
          Stop Copying Data.
        </h1>
        <p className="font-inter text-[18px] md:text-[20px] leading-[28px] md:leading-[32px] text-[#5B5B5B] max-w-[600px] mb-10">
          Get it live in Excel/Google Sheets
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              href="/signup"
              className="bg-[#D1FC00] text-[#1C1917] font-inter font-bold text-[16px] px-[32px] py-[16px] rounded-full hover:bg-[#C5ED00] transition-colors"
            >
              Try for Free
            </Link>
            <Link
              href="#how-it-works"
              className="bg-[#F0F0F0] text-[#1C1917] font-inter font-bold text-[16px] px-[32px] py-[16px] rounded-full hover:bg-[#E2E2E2] transition-colors"
            >
              How it works
            </Link>
        </div>
      </section>

      {/* ── FEATURE CARDS ────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-12 flex justify-center">
        <div className="max-w-[1280px] w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURE_CARDS.map((card, i) => (
                <div key={i} className="bg-[#F6F6F6] rounded-[32px] p-8 flex flex-col items-start hover:bg-[#F0F0F0] transition-colors">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-6 text-xl shadow-sm" style={{ backgroundColor: card.color }}>
                        {card.icon}
                    </div>
                    <h3 className="font-manrope font-bold text-[18px] text-[#1C1917] mb-2">{card.title}</h3>
                    <p className="font-inter text-[14px] leading-[24px] text-[#5B5B5B]">{card.desc}</p>
                </div>
            ))}
        </div>
      </section>

      {/* ── LIVE INSIGHTS ────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-20 flex justify-center">
        <div className="max-w-[1280px] w-full">
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6">
                <div>
                    <h2 className="font-manrope font-extrabold text-[36px] tracking-[-1px] text-[#1C1917] mb-3">
                        Live Insights
                    </h2>
                    <p className="font-inter text-[16px] text-[#5B5B5B]">
                        Browse ready-to-sync datasets powered by our live-<br className="hidden md:block" />scraping engine.
                    </p>
                </div>
                <Link href="/datasets" className="font-inter font-bold text-[14px] text-[#1C1917] border-b border-[#1C1917] pb-1 hover:text-[#5B5B5B] hover:border-[#5B5B5B] transition-colors">
                    Browse all Datasets →
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {liveInsights.map((ds, i) => (
                    <div key={i} className="bg-white rounded-[40px] border border-[#F0F0F0] p-8 flex flex-col h-full min-h-[380px] shadow-[0_4px_24px_-12px_rgba(0,0,0,0.05)]">
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-6 gap-4">
                                <h3 className="font-manrope font-bold text-[20px] text-[#1C1917] leading-tight flex-1">{ds.title}</h3>
                                <span className="font-inter font-bold text-[10px] uppercase tracking-[1.5px] text-[#A8A29E] bg-[#FAFAFA] px-2 py-1 rounded-sm shrink-0 drop-shadow-sm">{ds.category}</span>
                            </div>
                            
                            <div className="flex flex-col gap-3 mt-8">
                                {ds.data.map((d: any, j: number) => (
                                    <div key={j} className="flex justify-between items-center py-2 border-b border-[#F6F6F6] last:border-0 gap-4">
                                        <span className="font-inter font-bold text-[14px] text-[#5B5B5B] capitalize truncate flex-1">{d.label}</span>
                                        <span className="font-inter font-bold text-[14px] text-[#4C5D00] truncate shrink-0 max-w-[100px] text-right">{d.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto pt-8">
                            <div className="flex items-center gap-1.5 mb-5 opacity-60">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#D1FC00]"></div>
                                <span className="font-inter text-[11px] text-[#A8A29E]">{ds.updated}</span>
                            </div>
                            <Link href={`/datasets/${ds.slug}`} className="w-full bg-[#D1FC00] text-[#1C1917] font-inter font-bold text-[14px] py-4 rounded-full hover:bg-[#C5ED00] flex justify-center items-center gap-2 transition-colors">
                                Use this data →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* ── BLACK CTA BOX ─────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-12 flex justify-center">
        <div className="max-w-[1280px] w-full bg-[#0A0A0A] rounded-[40px] md:rounded-[48px] p-10 md:p-[80px] flex flex-col items-center justify-center text-center gap-12">
            <div className="max-w-[600px] flex flex-col items-center">
                <h2 className="font-manrope font-extrabold text-[32px] md:text-[48px] leading-[1.1] tracking-[-1px] md:tracking-[-1.5px] text-white mb-6">
                    Data that moves with you.
                </h2>
                <p className="font-inter text-[14px] md:text-[16px] leading-[22px] md:leading-[26px] text-white/70 mb-8">
                    Our live-sync engine ensures your spreadsheets are never out of date. Connect once, stay updated forever.
                </p>
                <Link
                    href="/datasets"
                    className="inline-flex bg-[#D1FC00] text-[#1C1917] font-inter font-bold text-[15px] px-[32px] py-[16px] rounded-full hover:bg-[#C5ED00] transition-colors gap-2 items-center"
                >
                    Explore Datasets →
                </Link>
            </div>
        </div>
      </section>

      {/* ── THREE STEPS ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="px-6 md:px-12 py-24 flex flex-col items-center">
        <h2 className="font-manrope font-bold text-[32px] tracking-[-1px] text-[#1C1917] mb-[80px]">
            Three steps to live data.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24 max-w-[1000px] w-full">
            {[
                { n: '01', title: 'Pick a Source', desc: 'Choose from thousands of pre-built datasets.' },
                { n: '02', title: 'Apply Filters', desc: 'Get exactly the rows and columns you need.' },
                { n: '03', title: 'Sync to Excel or Google Sheets', desc: 'Data flows in automatically. No code required.' },
            ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                    <span className="font-manrope font-extrabold text-[56px] text-[#D1FC00] leading-none mb-6">{step.n}</span>
                    <h3 className="font-inter font-bold text-[18px] text-[#1C1917] mb-3">{step.title}</h3>
                    <p className="font-inter text-[15px] text-[#5B5B5B] max-w-[240px]">{step.desc}</p>
                </div>
            ))}
        </div>
      </section>

      {/* ── NEON BOTTOM BANNER ─────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 pb-24 flex justify-center">
        <div className="max-w-[1280px] w-full bg-[#D1FC00] rounded-[40px] md:rounded-[48px] p-10 md:p-[80px] flex flex-col items-center text-center">
            <h2 className="font-manrope font-extrabold text-[36px] sm:text-[48px] md:text-[64px] leading-[1.05] tracking-[-1px] md:tracking-[-2px] text-[#1C1917] mb-6 max-w-[800px]">
                Make a request to get the data you need.
            </h2>
            <p className="font-inter text-[15px] md:text-[18px] leading-[24px] md:leading-[28px] text-[#4C5D00] max-w-[600px] mb-10">
                Our team builds private extraction pipelines for the most complex enterprise requirements.
            </p>
            <Link
                href="/request"
                className="bg-[#1C1917] text-white font-inter font-bold text-[15px] md:text-[16px] px-[32px] py-[16px] md:px-[40px] md:py-[20px] rounded-full hover:bg-black transition-colors shadow-xl shadow-black/10"
            >
                Request a Custom Build
            </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="px-6 md:px-12 py-16 flex justify-center border-t border-[#F0F0F0]">
        <div className="max-w-[1280px] w-full flex flex-col md:flex-row justify-between gap-12 md:gap-0">
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-[12px]">
                    <img src="/logo.png" alt="Q.Labs Logo" className="h-[28px] object-contain" />
                </div>
                <p className="font-inter text-[12px] leading-[20px] text-[#A8A29E] max-w-[220px]">
                    The modern standard for automated data extraction and spreadsheet synchronization.
                </p>
                <div className="font-inter text-[11px] text-[#A8A29E] mt-8">
                    © 2024 Q.Labs. All rights reserved.
                </div>
            </div>

            <div className="flex gap-[120px]">
                <div className="flex flex-col gap-4">
                    <span className="font-inter font-bold text-[11px] uppercase tracking-[1.5px] text-[#1C1917]">Platform</span>
                    <Link href="/datasets" className="font-inter text-[13px] text-[#5B5B5B] hover:text-[#1C1917]">Datasets</Link>
                    <Link href="#" className="font-inter text-[13px] text-[#5B5B5B] hover:text-[#1C1917]">API Docs</Link>
                </div>
                <div className="flex flex-col gap-4">
                    <span className="font-inter font-bold text-[11px] uppercase tracking-[1.5px] text-[#1C1917]">Company</span>
                    <Link href="#" className="font-inter text-[13px] text-[#5B5B5B] hover:text-[#1C1917]">About</Link>
                    <Link href="#" className="font-inter text-[13px] text-[#5B5B5B] hover:text-[#1C1917]">Careers</Link>
                    <Link href="#" className="font-inter text-[13px] text-[#5B5B5B] hover:text-[#1C1917]">Contact</Link>
                </div>
            </div>
        </div>
      </footer>

    </main>
  );
}
