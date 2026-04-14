import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

// ─── JWT verify (Node.js crypto) - Deprecated for MVP V2 in favor of DB Lookup



// ─── Dataset Mapper ───────────────────────────────────────────────────────────
// We dynamically look up table_names from public.datasets, but maintain explicit overrides for legacy setups.
const DATASET_TABLE_MAP: Record<string, string> = {
  "dsex-prices-historical": "dsex_prices",
};

// ─── Route handler ────────────────────────────────────────────────────────────

const MAX_ROWS = 50000;

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> | { slug: string } } 
) {
  const resolvedParams = await Promise.resolve(context.params);
  const slug = resolvedParams.slug || "";

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const format = searchParams.get("format") || "json";

  if (!token) {
    return NextResponse.json(
      { error: "Missing ?token= parameter. Generate one via the dataset page." },
      { status: 401 }
    );
  }

  // --- Create Supabase Admin Client ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Ensure Dataset exists
  const { data: datasetMeta } = await supabase
      .from("datasets")
      .select("table_name")
      .eq("slug", slug)
      .maybeSingle();

  if (!datasetMeta) {
    return NextResponse.json(
      { error: "Unknown dataset. Make sure the dataset slug in the URL is correct." },
      { status: 404 }
    );
  }

  const dbTableName = DATASET_TABLE_MAP[slug] || datasetMeta.table_name || slug.replace(/-/g, "_");

  const { data: dbToken, error: tokenError } = await supabase
    .from("api_tokens")
    .select("status, dataset_slug, filters, user_id")
    .eq("token_string", token)
    .maybeSingle();

  if (tokenError || !dbToken) {
    return NextResponse.json({ error: "Invalid API token. Not found." }, { status: 401 });
  }

  if (dbToken.status === "revoked") {
    return NextResponse.json({ error: "Token has been revoked by the user." }, { status: 403 });
  }

  if (dbToken.dataset_slug !== slug) {
    return NextResponse.json({ error: "Token belongs to a different dataset." }, { status: 403 });
  }
  
  const payload = { filters: dbToken.filters || {}, dataset_slug: dbToken.dataset_slug };

  // --- Parse Custom Selected Columns ---
  const fieldsParam = searchParams.get("fields");
  const selectQuery = fieldsParam && fieldsParam.trim().length > 0 ? fieldsParam : "*";

  // --- Build Generic Query ---
  let query: any;
  if (slug === "dsex-prices-historical") {
     // Overload select globally to ensure we don't break the mapper relation by excluding its anchor keys
     query = supabase.from(dbTableName).select(`*, mapper:dsex_mapper!inner(trading_code, sector, category)`).order("date", { ascending: false }).limit(MAX_ROWS);
  } else {
     query = supabase.from(dbTableName).select(selectQuery).limit(MAX_ROWS);
  }
  
  const filters = payload.filters || {};
  
  // Generic filter application natively driven by JSON filters
  if (filters.start_date) query = query.gte("date", filters.start_date);
  if (filters.end_date) query = query.lte("date", filters.end_date);
  
  // Specific internal filter mapping support
  if (slug === "dsex-prices-historical") {
     const { companies = [], sectors = [] } = filters;
     if (companies.length > 0) query = query.in("mapper.trading_code", companies);
     if (sectors.length > 0) query = query.in("mapper.sector", sectors);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json([], { headers: { "Access-Control-Allow-Origin": "*" } });
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
    
    // Explicit dynamic column mapping for specific manual sets
    if (slug === "dsex-prices-historical" && fieldsParam && fieldsParam !== "*") {
      const requestedFields = fieldsParam.split(",").map(f => f.trim());
      const filteredObj: any = {};
      requestedFields.forEach(f => {
        if (flatItem[f] !== undefined) filteredObj[f] = flatItem[f];
      });
      return filteredObj;
    }
    
    return flatItem;
  });

  return NextResponse.json(rows, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "X-Row-Count": String(rows.length),
    }
  });
}
