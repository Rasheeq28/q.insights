import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        // Fetch unique sectors
        const { data: sectorsData, error: sectorError } = await supabase
            .from("dsex_mapper")
            .select("sector")
            .neq("sector", null)

        if (sectorError) throw sectorError;

        // Fetch unique trading codes
        const { data: codesData, error: codeError } = await supabase
            .from("dsex_mapper")
            .select("trading_code")
            .order("trading_code", { ascending: true });

        if (codeError) throw codeError;

        // Process to get distinct values (in case DB isn't normalized unique)
        const sectors = Array.from(new Set(sectorsData?.map((item) => item.sector).filter(Boolean)));
        const tradingCodes = codesData?.map((item) => item.trading_code) || [];

        return NextResponse.json({ sectors, tradingCodes });
    } catch (error: any) {
        console.error("Filter API Error:", error.message);
        return NextResponse.json({ sectors: [], tradingCodes: [] }, { status: 500 });
    }
}
