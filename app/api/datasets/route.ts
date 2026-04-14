import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';
import { MOCK_DATASETS } from "@/lib/mockData";
import { checkAndIncrementUsage } from "@/lib/rateLimiter";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const mode = searchParams.get("mode");
    const limit = 3; // Default limit for preview

    // ── 1. Fetch from Supabase (instead of Mock Data) ─────────────────────────
    if (slug) {
        try {
            const { data: dataset } = await supabase
                .from("datasets")
                .select("*")
                .eq("slug", slug)
                .maybeSingle();

            if (!dataset) return NextResponse.json({ error: "Dataset not found" }, { status: 404 });

            const dbTableName = dataset.table_name || slug.replace(/-/g, "_");

            // META MODE: Fetch min/max dates
            if (mode === "meta") {
                const { data: minData } = await supabase.from(dbTableName).select("date").order("date", { ascending: true }).limit(1).maybeSingle();
                const { data: maxData } = await supabase.from(dbTableName).select("date").order("date", { ascending: false }).limit(1).maybeSingle();
                return NextResponse.json({ minDate: minData?.date, maxDate: maxData?.date });
            }

            // Generic Data Fetching
            let query = supabase.from(dbTableName).select("*").order("created_at", { ascending: false }).limit(limit);
            
            // Apply standard filters if they exist
            const sector = searchParams.get("sector");
            const tradingCode = searchParams.get("trading_code");
            const startDate = searchParams.get("startDate");
            const endDate = searchParams.get("endDate");

            if (sector) query = query.eq("sector", sector);
            if (tradingCode) query = query.eq("trading_code", tradingCode);
            if (startDate) query = query.gte("date", startDate);
            if (endDate) query = query.lte("date", endDate);

            const { data, error } = await query;
            if (error) throw error;

            return NextResponse.json(data);
        } catch (e: any) {
            console.error("[DatasetAPI] Error:", e.message);
            return NextResponse.json({ error: e.message }, { status: 500 });
        }
    }

    // Default: List all active datasets
    const { data: allDatasets } = await supabase.from("datasets").select("*").eq("is_active", true);
    return NextResponse.json(allDatasets || []);
}
