import { createClient } from "@supabase/supabase-js";

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fake.supabase.co";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "fake";
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
     console.log("Need env vars. Running via Next.js env.");
  }
}
run();
