import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const reqUrl = new URL(request.url);
    const appBase = `${reqUrl.protocol}//${reqUrl.host}`;

    const body = await request.json();
    const { dataset_slug, filters = {} } = body;

    if (!dataset_slug) {
      return NextResponse.json(
        { error: "Missing dataset_slug in body" },
        { status: 400 }
      );
    }

    // --- Validate Authentication ---
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized. Missing bearer token." },
        { status: 401 }
      );
    }

    const sessionToken = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication session." },
        { status: 401 }
      );
    }

    // --- Build simple token ---
    const token = "qlabs_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // --- Insert Token into Dashboard Tracking Table ---
    const { error: insertError } = await supabase.from("api_tokens").insert({
      user_id: user.id,
      dataset_slug,
      token_string: token,
      filters,
      status: "active"
    });

    if (insertError) {
      console.error("Failed to insert api token to db:", insertError);
      return NextResponse.json({ error: "Failed to persist token" }, { status: 500 });
    }

    // --- Build API URL (Defaults to JSON) ---
    const apiUrl = `${appBase}/api/datasets/${dataset_slug}?token=${token}`;
    
    // 30 days from now
    const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
    const expiresAt = new Date(exp * 1000).toISOString();

    return NextResponse.json({ 
      token, 
      api_url: apiUrl, 
      expires_at: expiresAt 
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    console.error("generate-token error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
