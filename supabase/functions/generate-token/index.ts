// Supabase Edge Function: generate-token
// POST /functions/v1/generate-token
// Body: { companies?: string[], sectors?: string[], start?: string, end?: string }
// Returns: { token: string, api_url: string, expires_at: string }

import { signToken } from "../_shared/jwt.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const {
      companies = [],
      sectors = [],
      start = "",
      end = "",
    } = body as {
      companies?: string[];
      sectors?: string[];
      start?: string;
      end?: string;
    };

    // --- Input Validation ---

    // Max 10 companies
    if (companies.length > 10) {
      return new Response(
        JSON.stringify({ error: "Maximum 10 companies allowed per token" }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Date validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (start && !dateRegex.test(start)) {
      return new Response(
        JSON.stringify({ error: "Invalid start date format. Use YYYY-MM-DD" }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }
    if (end && !dateRegex.test(end)) {
      return new Response(
        JSON.stringify({ error: "Invalid end date format. Use YYYY-MM-DD" }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Max 2-year date range
    if (start && end) {
      const startMs = new Date(start).getTime();
      const endMs = new Date(end).getTime();
      if (endMs < startMs) {
        return new Response(
          JSON.stringify({ error: "end date must be after start date" }),
          {
            status: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          }
        );
      }
      const twoYearsMs = 2 * 365 * 24 * 60 * 60 * 1000;
      if (endMs - startMs > twoYearsMs) {
        return new Response(
          JSON.stringify({ error: "Date range cannot exceed 2 years" }),
          {
            status: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          }
        );
      }
    }

    // --- Build JWT ---
    const jwtSecret = Deno.env.get("JWT_SECRET");
    if (!jwtSecret) {
      throw new Error("JWT_SECRET environment variable is not configured");
    }

    const now = Math.floor(Date.now() / 1000);
    const expirySeconds = 30 * 24 * 60 * 60; // 30 days
    const exp = now + expirySeconds;

    const payload = {
      filters: {
        companies,
        sectors,
        start,
        end,
      },
      plan: "free",
      iat: now,
      exp,
    };

    const token = await signToken(payload, jwtSecret);

    // Build the API URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    // Replace the base URL with the functions URL
    const functionsBase = supabaseUrl.replace(
      ".supabase.co",
      ".supabase.co/functions/v1"
    );
    const apiUrl = `${functionsBase}/dsex-api?token=${token}`;

    const expiresAt = new Date(exp * 1000).toISOString();

    return new Response(
      JSON.stringify({
        token,
        api_url: apiUrl,
        expires_at: expiresAt,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("generate-token error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
