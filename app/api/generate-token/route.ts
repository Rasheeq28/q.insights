import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";

// ─── JWT helpers (Node.js crypto — no external deps) ─────────────────────────

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signJwt(payload: Record<string, unknown>, secret: string): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;
  const signature = createHmac("sha256", secret)
    .update(signingInput)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${signingInput}.${signature}`;
}

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

    // --- JWT secret ---
    const jwtSecret =
      process.env.JWT_SECRET || process.env.API_SECRET_KEY;
    if (!jwtSecret) {
      return NextResponse.json(
        { error: "JWT_SECRET is not configured on this server" },
        { status: 500 }
      );
    }

    // --- Build and sign token ---
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 30 * 24 * 60 * 60; // 30 days

    const payload = {
      dataset_slug,
      filters, // generic filters
      iat: now,
      exp,
    };

    const token = signJwt(payload, jwtSecret);

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

    // --- Build API URL (Progressive Disclosure defaults to CSV) ---
    const apiUrl = `${appBase}/api/datasets/${dataset_slug}?token=${token}`;
    
    // Developer JSON API syntax hint:
    const jsonApiUrl = `${apiUrl}&format=json`;

    const expiresAt = new Date(exp * 1000).toISOString();

    return NextResponse.json({ 
      token, 
      api_url: apiUrl, 
      json_api_url: jsonApiUrl,
      expires_at: expiresAt 
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    console.error("generate-token error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
