import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchInsightData, InsightCardConfig } from "@/lib/insights";

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


// ─── GET /api/insights ─────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataset = searchParams.get("dataset"); // optional filter by dataset slug
  const slug = searchParams.get("slug");       // fetch single card

  try {
    // Build query
    let query = supabase
      .from("insight_cards")
      .select("*, dataset:datasets!inner(title, tags)")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (dataset) query = query.eq("dataset_slug", dataset);
    if (slug) query = query.eq("slug", slug).single() as typeof query;

    const { data: cards, error } = await query;
    if (error) throw error;

    if (!cards) return NextResponse.json([]);

    const cardsArray = Array.isArray(cards) ? cards : [cards];

    // Enrich each card with live data from its SQL view
    const enriched = await Promise.all(
      cardsArray.map(async (card: Record<string, unknown>) => {
        const data = await fetchInsightData({
          slug: card.slug as string,
          type: card.type as string,
          config: (card.config ?? {}) as InsightCardConfig,
        });

        const datasetMeta = card.dataset as Record<string, unknown> | null;
        const tags = (datasetMeta?.tags as string[]) ?? [];

        return {
          slug: card.slug,
          title: card.title,
          description: card.description,
          type: card.type,
          dataset_slug: card.dataset_slug,
          dataset_title: datasetMeta?.title ?? card.dataset_slug,
          tag: tags[0] ?? null,
          data,
          lastUpdated: new Date().toISOString(),
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch insights";
    console.error("[InsightAPI] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
