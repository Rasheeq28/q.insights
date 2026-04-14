import { supabase } from "./supabase";

export interface InsightCardConfig {
  view: string;
  columns: string[];
}

export async function fetchInsightData(card: {
  slug: string;
  type: string;
  config: InsightCardConfig;
}) {
  const { view, columns } = card.config;
  if (!view) return null;

  try {
    const selectStr = columns && columns.length > 0 ? columns.join(",") : "*";
    const { data, error } = await supabase.from(view).select(selectStr);
    
    if (error) {
      console.error(`[InsightLib] Error fetching ${view}:`, error.message);
      return null;
    }

    // For "stat" cards, return first row as object instead of array
    if (card.type === "stat") return data?.[0] ?? null;
    return data ?? [];
  } catch (err) {
    console.error(`[InsightLib] Unexpected error for ${view}:`, err);
    return null;
  }
}
