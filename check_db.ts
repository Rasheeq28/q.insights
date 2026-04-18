import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get a user to test with
  const { data: users, error: authErr } = await supabase.auth.admin.listUsers({ limit: 1 });
  if (authErr || !users.users.length) {
     console.log("Failed to fetch user", authErr);
     if(!users?.users?.length) console.log("No users in db");
     return;
  }
  const user = users.users[0];
  console.log("Testing with user:", user.id);

  // Try inserting
  const token = "test_token_" + Math.random();
  const { data, error } = await supabase.from("api_tokens").insert({
    user_id: user.id,
    dataset_slug: "test-slug",
    token_string: token,
    filters: { columns: ["trading_code"] },
    status: "active"
  });

  if (error) {
    console.error("INSERT ERROR:", error);
  } else {
    console.log("INSERT SUCCESS");
    
    // Test selecting the token (this bypasses RLS because service key)
    const { data: fetchTokens, error: fetchErr } = await supabase.from("api_tokens").select("*").eq("token_string", token);
    console.log("Fetched token:", fetchTokens, fetchErr);
    
    // Let's also check the actual columns
  }
}
run();
