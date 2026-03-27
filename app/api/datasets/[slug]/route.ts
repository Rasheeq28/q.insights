import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

// ─── JWT verify (Node.js crypto) ──────────────────────────────────────────────

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString("utf-8");
}

function verifyJwt(
  token: string,
  secret: string
): { filters: any; dataset_slug: string; exp: number } {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");

  const [headerB64, payloadB64, sigB64] = parts;
  const signingInput = `${headerB64}.${payloadB64}`;

  const expectedSig = createHmac("sha256", secret)
    .update(signingInput)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const a = Buffer.from(sigB64);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid token signature");
  }

  const payload = JSON.parse(base64UrlDecode(payloadB64));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) throw new Error("Token expired");

  return payload;
}

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ─── Dataset Mapper ───────────────────────────────────────────────────────────

const DATASET_TABLE_MAP: Record<string, string> = {
  "dsex-prices-historical": "dsex_prices",
  // Add other local datasets here
};

// ─── Route handler ────────────────────────────────────────────────────────────

const MAX_ROWS = 5000;

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> | { slug: string } } 
) {
  const resolvedParams = await Promise.resolve(context.params);
  const slug = resolvedParams.slug || "";

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const format = searchParams.get("format") || "csv"; // Progressive Disclosure

  if (!token) {
    return NextResponse.json(
      { error: "Missing ?token= parameter. Generate one via the dataset page." },
      { status: 401 }
    );
  }

  if (!slug || !DATASET_TABLE_MAP[slug]) {
    return NextResponse.json(
      { error: "Unknown dataset. Make sure the dataset slug in the URL is correct." },
      { status: 404 }
    );
  }

  const dbTableName = DATASET_TABLE_MAP[slug];

  const secret = process.env.JWT_SECRET || process.env.API_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "Server misconfiguration: JWT_SECRET not set" },
      { status: 500 }
    );
  }

  // --- Verify Token Crypto Signature ---
  let payload: ReturnType<typeof verifyJwt>;
  try {
    payload = verifyJwt(token, secret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid token";
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  // --- Ensure Dataset Slug Matches Token ---
  if (payload.dataset_slug !== slug) {
    // Fallback allowing old tokens that didn't have dataset_slug
    if (payload.dataset_slug && payload.dataset_slug !== slug) {
       return NextResponse.json({ error: "Token belongs to a different dataset." }, { status: 403 });
    }
  }

  // --- Create Supabase Admin Client ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // --- Optional: Check if token is revoked in DB ---
  // Using token directly. Note: In a prod env we'd hash the token to lookup, but for MVP:
  const { data: dbToken } = await supabase
    .from("api_tokens")
    .select("status")
    .eq("token_string", token)
    .maybeSingle();

  if (dbToken && dbToken.status === "revoked") {
    return NextResponse.json({ error: "Token has been revoked by the user." }, { status: 403 });
  }

  // --- Build Generic Query ---
  // We apply filters blindly from the JWT payload. The JWT payload is trusted.
  let query = supabase.from(dbTableName).select("*").limit(MAX_ROWS);
  
  const filters = payload.filters || {};
  
  // Specific DSEX logic fallback since its schema is unique with `mapper`
  if (slug === "dsex-prices-historical") {
     query = supabase
        .from("dsex_prices")
        .select(`*, mapper:dsex_mapper!inner(trading_code, sector, category)`)
        .order("date", { ascending: false })
        .limit(MAX_ROWS);
        
     const { companies = [], sectors = [], start = "", end = "" } = filters;
     if (companies.length > 0) query = query.in("mapper.trading_code", companies);
     if (sectors.length > 0) query = query.in("mapper.sector", sectors);
     if (start) query = query.gte("date", start);
     if (end) query = query.lte("date", end);
  } else {
     // Generic filter application
     if (filters.start_date) query = query.gte("date", filters.start_date);
     if (filters.end_date) query = query.lte("date", filters.end_date);
     // ... add more generic filter mappings here based on token format
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    if (format === "json") {
      return NextResponse.json([], { headers: { "Access-Control-Allow-Origin": "*" } });
    }
    return new NextResponse("No data found\n", {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${slug}.csv"`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // Format and clean objects for both JSON and CSV
  const rows = data.map((item: any) => {
    const flatItem = { ...item };
    if (flatItem.mapper) {
      const mapper = Array.isArray(flatItem.mapper) ? flatItem.mapper[0] : flatItem.mapper;
      flatItem.trading_code = mapper?.trading_code ?? "";
      flatItem.sector = mapper?.sector ?? "";
      flatItem.category = mapper?.category ?? "";
      delete flatItem.mapper;
    }
    // Remove internal database IDs
    delete flatItem.id;
    delete flatItem.mapper_id;
    
    return flatItem;
  });

  // --- Progressive Disclosure Format Support ---
  if (format === "json") {
    return NextResponse.json(rows, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "X-Row-Count": String(rows.length),
      }
    });
  }

  // --- CSV Formatting ---
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${slug}.csv"`,
      "X-Row-Count": String(rows.length),
      "Access-Control-Allow-Origin": "*",
    },
  });
}
