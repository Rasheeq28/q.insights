// Supabase Edge Function: dsex-api
// GET /functions/v1/dsex-api?token=<jwt>
// Returns: CSV of DSEX price data filtered by token payload

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyToken } from "../_shared/jwt.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const MAX_ROWS = 5000;

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        JSON.stringify({
          error: "Missing token. Generate one via POST /functions/v1/generate-token",
        }),
        {
          status: 401,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Verify and decode the token
    const jwtSecret = Deno.env.get("JWT_SECRET");
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured on this server");
    }

    let payload;
    try {
      payload = await verifyToken(token, jwtSecret);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid token";
      return new Response(JSON.stringify({ error: msg }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const { companies = [], sectors = [], start = "", end = "" } =
      payload.filters;

    // Create Supabase admin client (service role)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Build query — join dsex_prices with dsex_mapper
    let query = supabase
      .from("dsex_prices")
      .select(
        `
        *,
        mapper:dsex_mapper!inner(trading_code, sector, category)
      `
      )
      .order("date", { ascending: false })
      .limit(MAX_ROWS);

    // Apply filters from token payload
    if (companies.length > 0) {
      query = query.in("mapper.trading_code", companies);
    }
    if (sectors.length > 0) {
      query = query.in("mapper.sector", sectors);
    }
    if (start) {
      query = query.gte("date", start);
    }
    if (end) {
      query = query.lte("date", end);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (!data || data.length === 0) {
      // Return empty CSV with headers
      const emptyBody =
      "date,trading_code,sector,category,openp,high,low,closep,volume\n";
      return new Response(emptyBody, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="dsex_data.csv"',
        },
      });
    }

    // Flatten the nested mapper object
    const rows = data.map((item: Record<string, unknown>) => {
      const mapper = item.mapper as Record<string, unknown> | null;
      return {
        date: item.date ? new Date(item.date as string).toISOString().split("T")[0] : "",
        trading_code: mapper?.trading_code ?? "",
        sector: mapper?.sector ?? "",
        category: mapper?.category ?? "",
        openp: item.openp,
        high: item.high,
        low: item.low,
        closep: item.closep,
        volume: item.volume,
      };
    });

    // Build CSV string
    const headers = Object.keys(rows[0]);
    const csvLines = [
      headers.join(","),
      ...rows.map((row: Record<string, unknown>) =>
        headers.map((h) => escapeCsv(row[h])).join(",")
      ),
    ];
    const csvBody = csvLines.join("\n");

    return new Response(csvBody, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="dsex_data.csv"',
        "X-Row-Count": String(rows.length),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("dsex-api error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
