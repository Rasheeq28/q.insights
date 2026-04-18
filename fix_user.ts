import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Parse .env.local manually
const envPath = ".env.local";
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...val] = line.split("=");
    if (key && val.length > 0) {
      process.env[key.trim()] = val.join("=").trim().replace(/"/g, "");
    }
  });
}

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  const userId = "bb61d7c3-abcf-4cda-90c4-26a6d779fd06"; // User ID from user's screenshot
  
  // Attempt to upsert the user into public.users
  const { data: userAuth, error: fetchErr } = await supabase.auth.admin.getUserById(userId);
  if (fetchErr) {
    console.error("Auth Fetch Error:", fetchErr);
  }
  
  const email = userAuth?.user?.email || "unknown@example.com";
  
  console.log("Upserting user into public.users table:");
  const { data, error } = await supabase.from("users").upsert({ id: userId, email: email, full_name: "Qlabs User" });
  console.log("Upsert result:", error || "Success");

  if(error) {
     console.log("Let's try just ID:");
     const { data: d2, error: e2 } = await supabase.from("users").upsert({ id: userId });
     console.log("Upsert ID only:", e2 || "Success");
  }
  
  // Remove the foreign key safely? No, we shouldn't drop FK via script. Let's just fix the api_tokens row if upsert works.
}
run();
