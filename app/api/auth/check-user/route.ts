import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Initialize admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check auth.users by searching. listUsers might be slow for massive DBs,
    // but without an RPC or direct Admin API `getUserByEmail`, this is standard.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error("Error fetching auth.users:", authError);
      return NextResponse.json({ error: "Failed to verify user against auth DB" }, { status: 500 });
    }

    const authUserExists = authData.users.some((u) => u.email === email);

    // Check public.users
    const { data: publicUser, error: publicError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (publicError && publicError.code !== '42P01') {
      // 42P01 is undefined table (if public.users doesn't exist)
      console.warn("Public users table access warning:", publicError);
    }

    if (authUserExists || publicUser) {
      return NextResponse.json({ exists: true });
    }

    return NextResponse.json({ exists: false });
  } catch (error: any) {
    console.error("User check error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
